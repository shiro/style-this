use std::collections::HashMap;
use std::sync::{Arc, Mutex as StdMutex};
use tokio::sync::Notify;
use once_cell::sync::Lazy;
use wasm_bindgen::prelude::*;

/// Global singleton for tracking files being transformed
pub static GLOBAL_SYNC: Lazy<GlobalSync> = Lazy::new(GlobalSync::new);

/// Synchronization primitive for atomic settlement
/// Tracks which files are currently being transformed and provides
/// an async method to wait until all transformations are complete
pub struct GlobalSync {
    inner: Arc<StdMutex<GlobalSyncInner>>,
    notify: Arc<Notify>,
}

struct GlobalSyncInner {
    /// Map of filename -> reference count
    /// When a file is added, its count is incremented
    /// When removed, count is decremented and removed if 0
    transforming_files: HashMap<String, usize>,
}

impl GlobalSync {
    fn new() -> Self {
        Self {
            inner: Arc::new(StdMutex::new(GlobalSyncInner {
                transforming_files: HashMap::new(),
            })),
            notify: Arc::new(Notify::new()),
        }
    }

    /// Add a file to the tracking list (or increment its ref count)
    pub fn add(&self, filename: String) {
        let mut inner = self.inner.lock().unwrap();
        let count = inner.transforming_files.entry(filename.clone()).or_insert(0);
        *count += 1;
        #[cfg(target_arch = "wasm32")]
        web_sys::console::log_1(&format!("[atomic_sync] ADD: {} (count={})", filename, *count).into());
    }

    /// Remove a file from the tracking list (or decrement its ref count)
    /// If the count reaches 0, the file is removed from the map
    /// If the map becomes empty after removal, notifies all waiters
    pub fn remove(&self, filename: &str) {
        let mut inner = self.inner.lock().unwrap();
        
        #[cfg(target_arch = "wasm32")]
        web_sys::console::log_1(&format!("[atomic_sync] REMOVE: {}", filename).into());
        
        if let Some(count) = inner.transforming_files.get_mut(filename) {
            *count -= 1;
            #[cfg(target_arch = "wasm32")]
            web_sys::console::log_1(&format!("[atomic_sync] Decremented {} to {}", filename, *count).into());
            if *count == 0 {
                inner.transforming_files.remove(filename);
                #[cfg(target_arch = "wasm32")]
                web_sys::console::log_1(&format!("[atomic_sync] Removed {}", filename).into());
            }
        } else {
            #[cfg(target_arch = "wasm32")]
            web_sys::console::log_1(&format!("[atomic_sync] WARN: {} not found in map", filename).into());
        }
        
        // If map is now empty, notify all waiters
        if inner.transforming_files.is_empty() {
            #[cfg(target_arch = "wasm32")]
            web_sys::console::log_1(&"[atomic_sync] Map is empty, notifying waiters".into());
            drop(inner); // Release lock before notifying
            self.notify.notify_waiters();
        }
    }

    /// Returns immediately with true if map is empty, otherwise waits until it becomes empty
    /// This allows the caller to await settlement of all transformations
    pub async fn is_ready(&self) -> bool {
        loop {
            {
                let inner = self.inner.lock().unwrap();
                if inner.transforming_files.is_empty() {
                    return true;
                }
            }
            
            // Wait for notification that map might have become empty
            self.notify.notified().await;
        }
    }

    /// Get current count of files being transformed (for debugging)
    #[allow(dead_code)]
    pub fn count(&self) -> usize {
        let inner = self.inner.lock().unwrap();
        inner.transforming_files.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_add_remove() {
        let sync = GlobalSync::new();
        
        // Initially ready
        assert!(sync.inner.lock().unwrap().transforming_files.is_empty());
        
        // Add file
        sync.add("file1.ts".to_string());
        assert_eq!(sync.count(), 1);
        
        // Add same file again
        sync.add("file1.ts".to_string());
        assert_eq!(sync.count(), 1);
        assert_eq!(*sync.inner.lock().unwrap().transforming_files.get("file1.ts").unwrap(), 2);
        
        // Remove once - should still be tracked
        sync.remove("file1.ts");
        assert_eq!(sync.count(), 1);
        assert_eq!(*sync.inner.lock().unwrap().transforming_files.get("file1.ts").unwrap(), 1);
        
        // Remove again - should be gone
        sync.remove("file1.ts");
        assert_eq!(sync.count(), 0);
    }

    #[tokio::test]
    async fn test_is_ready() {
        let sync = GlobalSync::new();
        
        // Should be ready initially
        assert!(sync.inner.lock().unwrap().transforming_files.is_empty());
        
        // Add a file
        sync.add("file1.ts".to_string());
        
        // Remove it
        sync.remove("file1.ts");
        
        // Should be ready now
        assert!(sync.is_ready().await);
    }

    #[tokio::test]
    async fn test_multiple_files() {
        let sync = GlobalSync::new();
        
        sync.add("file1.ts".to_string());
        sync.add("file2.ts".to_string());
        sync.add("file3.ts".to_string());
        
        assert_eq!(sync.count(), 3);
        
        sync.remove("file1.ts");
        assert_eq!(sync.count(), 2);
        
        sync.remove("file2.ts");
        sync.remove("file3.ts");
        
        assert!(sync.is_ready().await);
    }
}

// JavaScript API for removing files from tracking after CSS evaluation
#[wasm_bindgen]
pub fn atomic_sync_remove_file(filename: String) {
    GLOBAL_SYNC.remove(&filename);
}

