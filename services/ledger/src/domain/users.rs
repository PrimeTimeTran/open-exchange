use crate::proto::common;
use chrono::Utc;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

#[derive(Debug, Default, Clone)]
pub struct UserService {
    users: Arc<Mutex<Vec<common::User>>>,
}

impl UserService {
    pub fn new() -> Self {
        Self {
            users: Arc::new(Mutex::new(Vec::new())),
        }
    }

    /// Creates a new user with generated ID and timestamps
    pub fn create_new_user(
        &self,
        email: String,
        _password: String,
        _first_name: String,
        _last_name: String,
    ) -> common::User {
        let user = common::User {
            id: Uuid::new_v4().to_string(),
            email,
            email_verified: false,
            provider: "local".to_string(),
            provider_id: "".to_string(),
            created_at: Utc::now().timestamp_millis(),
            updated_at: Utc::now().timestamp_millis(),
        };

        let mut users = self.users.lock().unwrap();
        users.push(user.clone());
        user
    }

    pub fn create_user(&self, user: common::User) {
        let mut users = self.users.lock().unwrap();
        users.push(user);
    }

    pub fn get_user(&self, user_id: &str) -> Option<common::User> {
        let users = self.users.lock().unwrap();
        users.iter().find(|x| x.id == user_id).cloned()
    }

    pub fn update_user(&self, user: common::User) -> bool {
        let mut users = self.users.lock().unwrap();
        if let Some(pos) = users.iter().position(|x| x.id == user.id) {
            users[pos] = user;
            true
        } else {
            false
        }
    }

    pub fn delete_user(&self, user_id: &str) -> bool {
        let mut users = self.users.lock().unwrap();
        if let Some(pos) = users.iter().position(|x| x.id == user_id) {
            users.remove(pos);
            true
        } else {
            false
        }
    }
}
