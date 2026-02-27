pub mod model;

use crate::domain::users::model::User;
use crate::error::{AppError, Result};
use std::sync::{Arc, Mutex};
use uuid::Uuid;

pub trait UserRepository: Send + Sync + std::fmt::Debug {
    fn create(&self, user: User) -> Result<()>;
    fn get(&self, user_id: Uuid) -> Result<Option<User>>;
    fn update(&self, user: User) -> Result<bool>;
    fn delete(&self, user_id: Uuid) -> Result<bool>;
}

#[derive(Debug, Default)]
pub struct InMemoryUserRepository {
    users: Mutex<Vec<User>>,
}

impl InMemoryUserRepository {
    pub fn new() -> Self {
        Self {
            users: Mutex::new(Vec::new()),
        }
    }
}

impl UserRepository for InMemoryUserRepository {
    fn create(&self, user: User) -> Result<()> {
        let mut users = self
            .users
            .lock()
            .map_err(|e| AppError::Internal(format!("User mutex poisoned: {}", e)))?;
        users.push(user);
        Ok(())
    }

    fn get(&self, user_id: Uuid) -> Result<Option<User>> {
        let users = self
            .users
            .lock()
            .map_err(|e| AppError::Internal(format!("User mutex poisoned: {}", e)))?;
        Ok(users.iter().find(|x| x.id == user_id).cloned())
    }

    fn update(&self, user: User) -> Result<bool> {
        let mut users = self
            .users
            .lock()
            .map_err(|e| AppError::Internal(format!("User mutex poisoned: {}", e)))?;
        if let Some(pos) = users.iter().position(|x| x.id == user.id) {
            users[pos] = user;
            Ok(true)
        } else {
            Ok(false)
        }
    }

    fn delete(&self, user_id: Uuid) -> Result<bool> {
        let mut users = self
            .users
            .lock()
            .map_err(|e| AppError::Internal(format!("User mutex poisoned: {}", e)))?;
        if let Some(pos) = users.iter().position(|x| x.id == user_id) {
            users.remove(pos);
            Ok(true)
        } else {
            Ok(false)
        }
    }
}

#[derive(Clone, Debug)]
pub struct UserService {
    repo: Arc<dyn UserRepository>,
}

impl UserService {
    pub fn new(repo: Arc<dyn UserRepository>) -> Self {
        Self { repo }
    }

    /// Creates a new user with generated ID and timestamps
    pub fn create_new_user(
        &self,
        tenant_id: Uuid,
        email: String,
        password: String,
        _first_name: String,
        _last_name: String,
    ) -> Result<User> {
        let user = User {
            id: Uuid::new_v4(),
            tenant_id,
            username: email.clone(),
            email,
            password_hash: password,
            meta: serde_json::json!({}),
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        };

        self.repo.create(user.clone())?;
        Ok(user)
    }

    pub fn create_user(&self, user: User) -> Result<()> {
        self.repo.create(user)
    }

    pub fn get_user(&self, user_id: &str) -> Result<Option<User>> {
        let user_id = Uuid::parse_str(user_id)
            .map_err(|_| AppError::ValidationError("Invalid user ID".into()))?;
        self.repo.get(user_id)
    }

    pub fn update_user(&self, user: User) -> Result<bool> {
        self.repo.update(user)
    }

    pub fn delete_user(&self, user_id: &str) -> Result<bool> {
        let user_id = Uuid::parse_str(user_id)
            .map_err(|_| AppError::ValidationError("Invalid user ID".into()))?;
        self.repo.delete(user_id)
    }
}
