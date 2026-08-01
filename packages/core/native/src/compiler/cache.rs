use futures::lock::Mutex as FutureMutex;
use std::cell::RefCell;
use std::collections::HashMap;
use std::collections::HashSet;
use std::rc::Rc;

thread_local! {
    pub(crate) static CSS_CLASSNAME_CACHE: RefCell<HashMap<String, HashMap<u32, String>>> = RefCell::new(HashMap::new());
    pub(crate) static VALUE_CACHE: RefCell<HashMap<String, Rc<FutureMutex<HashSet<String>>>>> = RefCell::new(HashMap::new());
}
