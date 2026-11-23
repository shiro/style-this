use futures::lock::Mutex as FutureMutex;
use std::cell::RefCell;
use std::collections::HashMap;
use std::collections::HashSet;
use std::rc::Rc;

thread_local! {
    pub(crate) static VALUE_CACHE: RefCell<HashMap<String, Rc<FutureMutex<HashSet<String>>>>> = RefCell::new(HashMap::new());
}
