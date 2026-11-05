use std::collections::{HashMap, HashSet};
use std::rc::Rc;
use std::cell::RefCell;

/// Tracks which files depend on which variables from other files.
///
/// When a file changes, we can determine which importers need invalidation
/// by checking which exports actually changed and only invalidating importers
/// that depend on those specific exports.
///
/// Example:
/// - B.tsx exports `color` and `size`
/// - A.tsx imports `{ color }` from B.tsx
/// - C.tsx imports `{ size }` from B.tsx
/// - D.tsx imports `* as B` from B.tsx
///
/// Storage:
/// - variable_importers: {"B.tsx" -> {"color" -> ["A.tsx"], "size" -> ["C.tsx"], "__star__" -> ["D.tsx"]}}
/// - file_imports: {"A.tsx" -> {"B.tsx" -> ["color"]}, "C.tsx" -> {"B.tsx" -> ["size"]}, "D.tsx" -> {"B.tsx" -> ["__star__"]}}
#[derive(Clone)]
pub struct DependencyTracker {
    /// Maps: source_filepath -> (variable_name -> [list of importer filepaths])
    /// Tracks WHO imports WHAT from WHERE
    /// Special keys: "__default__" for default imports, "__star__" for namespace imports
    variable_importers: Rc<RefCell<HashMap<String, HashMap<String, HashSet<String>>>>>,
    
    /// Maps: importer_filepath -> (source_filepath -> [imported_variables])
    /// Reverse index for quick cleanup when an importer file changes
    file_imports: Rc<RefCell<HashMap<String, HashMap<String, HashSet<String>>>>>,
}

impl DependencyTracker {
    /// Create a new empty dependency tracker
    pub fn new() -> Self {
        Self {
            variable_importers: Rc::new(RefCell::new(HashMap::new())),
            file_imports: Rc::new(RefCell::new(HashMap::new())),
        }
    }
    
    /// Register that `importer_file` imports `variable_name` from `source_file`
    ///
    /// Handles:
    /// - Named imports: `import { foo } from './bar'` -> variable_name = "foo"
    /// - Default imports: `import foo from './bar'` -> variable_name = "__default__"
    /// - Namespace imports: `import * as foo from './bar'` -> variable_name = "__star__"
    pub fn register_import(
        &self,
        source_file: &str,
        variable_name: &str,
        importer_file: &str,
    ) {
        // Forward index: source -> variable -> importers
        let mut importers = self.variable_importers.borrow_mut();
        importers
            .entry(source_file.to_string())
            .or_default()
            .entry(variable_name.to_string())
            .or_default()
            .insert(importer_file.to_string());
        
        // Reverse index: importer -> source -> variables
        let mut imports = self.file_imports.borrow_mut();
        imports
            .entry(importer_file.to_string())
            .or_default()
            .entry(source_file.to_string())
            .or_default()
            .insert(variable_name.to_string());
    }
    
    /// Get files that import specific changed exports from `source_file`
    ///
    /// Only returns importers that:
    /// - Import one of the changed variables, OR
    /// - Use a star import (which gets invalidated for any change)
    ///
    /// This is the "smart invalidation" - we don't invalidate importers
    /// that only use unchanged exports.
    pub fn get_importers_of_changed_exports(
        &self,
        source_file: &str,
        changed_exports: &HashSet<String>,
    ) -> HashSet<String> {
        let importers_map = self.variable_importers.borrow();
        let Some(var_map) = importers_map.get(source_file) else {
            return HashSet::new();
        };
        
        let mut result = HashSet::new();
        
        // Add importers of changed exports
        for export_name in changed_exports {
            if let Some(importers) = var_map.get(export_name) {
                result.extend(importers.iter().cloned());
            }
        }
        
        // Always add star import users when anything changes
        if !changed_exports.is_empty() {
            if let Some(star_importers) = var_map.get("__star__") {
                result.extend(star_importers.iter().cloned());
            }
        }
        
        result
    }
    
    /// Get all files that transitively depend on changed exports from `source_file`.
    ///
    /// Empty `changed_exports` means any export might have changed. Since we don't track which
    /// imports affect which exports, every importer is assumed to have all of its exports changed.
    pub fn get_transitive_importers(
        &self,
        source_file: &str,
        changed_exports: &HashSet<String>,
    ) -> HashSet<String> {
        let mut result = HashSet::new();
        let mut visited = HashSet::new();

        let mut to_visit = if changed_exports.is_empty() {
            vec![source_file.to_string()]
        } else {
            visited.insert(source_file.to_string());
            self.get_importers_of_changed_exports(source_file, changed_exports)
                .into_iter()
                .collect()
        };

        while let Some(file) = to_visit.pop() {
            if file != source_file {
                result.insert(file.clone());
            }
            if !visited.insert(file.clone()) {
                continue;
            }
            to_visit.extend(self.get_all_importers(&file));
        }

        result
    }
    
    /// Clear all import registrations for `importer_file`
    ///
    /// Call this when a file is about to be re-transformed, as its imports might have changed.
    /// The file may have:
    /// - Removed imports
    /// - Added new imports
    /// - Changed which variables it imports
    pub fn clear_file_imports(&self, importer_file: &str) {
        // Remove from reverse index and get what we need to clean from forward index
        let mut imports = self.file_imports.borrow_mut();
        let Some(source_map) = imports.remove(importer_file) else {
            return; // This file had no imports registered
        };
        
        // Remove from forward index
        let mut importers = self.variable_importers.borrow_mut();
        for (source_file, variables) in source_map {
            if let Some(var_map) = importers.get_mut(&source_file) {
                for var_name in variables {
                    if let Some(importer_set) = var_map.get_mut(&var_name) {
                        importer_set.remove(importer_file);
                        
                        // Clean up empty sets
                        if importer_set.is_empty() {
                            var_map.remove(&var_name);
                        }
                    }
                }
                
                // Clean up empty variable maps
                if var_map.is_empty() {
                    importers.remove(&source_file);
                }
            }
        }
    }
    
    /// Clear all import registrations for a source file
    ///
    /// Call this when a file is deleted or no longer tracked.
    pub fn clear_file_as_source(&self, source_file: &str) {
        let mut importers = self.variable_importers.borrow_mut();
        importers.remove(source_file);
    }
    
    /// Get all files that import from `source_file` (regardless of what they import)
    pub fn get_all_importers(&self, source_file: &str) -> HashSet<String> {
        let importers_map = self.variable_importers.borrow();
        let Some(var_map) = importers_map.get(source_file) else {
            return HashSet::new();
        };
        
        let mut result = HashSet::new();
        for importers in var_map.values() {
            result.extend(importers.iter().cloned());
        }
        result
    }
    
    /// Get what variables `importer_file` imports from `source_file`
    pub fn get_imports_from_file(&self, importer_file: &str, source_file: &str) -> HashSet<String> {
        let imports = self.file_imports.borrow();
        imports
            .get(importer_file)
            .and_then(|sources| sources.get(source_file))
            .cloned()
            .unwrap_or_default()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_register_and_get_importers() {
        let tracker = DependencyTracker::new();
        
        tracker.register_import("b.tsx", "color", "a.tsx");
        tracker.register_import("b.tsx", "size", "c.tsx");
        
        let mut changed = HashSet::new();
        changed.insert("color".to_string());
        
        let importers = tracker.get_importers_of_changed_exports("b.tsx", &changed);
        assert_eq!(importers.len(), 1);
        assert!(importers.contains("a.tsx"));
    }
    
    #[test]
    fn test_star_import_always_invalidated() {
        let tracker = DependencyTracker::new();
        
        tracker.register_import("b.tsx", "color", "a.tsx");
        tracker.register_import("b.tsx", "__star__", "d.tsx");
        
        let mut changed = HashSet::new();
        changed.insert("color".to_string());
        
        let importers = tracker.get_importers_of_changed_exports("b.tsx", &changed);
        assert_eq!(importers.len(), 2);
        assert!(importers.contains("a.tsx"));
        assert!(importers.contains("d.tsx"));
    }
    
    #[test]
    fn test_transitive_importers() {
        let tracker = DependencyTracker::new();

        tracker.register_import("a.ts", "color", "b.tsx");
        tracker.register_import("a.ts", "size", "e.tsx");
        tracker.register_import("b.tsx", "derived", "c.tsx");
        tracker.register_import("c.tsx", "__default__", "d.tsx");

        let all = tracker.get_transitive_importers("a.ts", &HashSet::new());
        assert_eq!(all, ["b.tsx", "c.tsx", "d.tsx", "e.tsx"].map(String::from).into());

        let changed = HashSet::from(["color".to_string()]);
        let selective = tracker.get_transitive_importers("a.ts", &changed);
        assert_eq!(selective, ["b.tsx", "c.tsx", "d.tsx"].map(String::from).into());
    }

    #[test]
    fn test_clear_file_imports() {
        let tracker = DependencyTracker::new();
        
        tracker.register_import("b.tsx", "color", "a.tsx");
        tracker.register_import("c.tsx", "size", "a.tsx");
        
        // Clear a.tsx's imports
        tracker.clear_file_imports("a.tsx");
        
        let mut changed = HashSet::new();
        changed.insert("color".to_string());
        
        let importers = tracker.get_importers_of_changed_exports("b.tsx", &changed);
        assert!(importers.is_empty());
    }
}
