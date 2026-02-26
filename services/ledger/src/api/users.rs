use crate::domain::users::UserService as UserDomainService;
use crate::proto::ledger::user_service_server::UserService;
use crate::proto::ledger::*;
use std::sync::Arc;
use tonic::{Request, Response, Status};

pub struct UserServiceImpl {
    user_service: Arc<UserDomainService>,
}

impl UserServiceImpl {
    pub fn new(user_service: Arc<UserDomainService>) -> Self {
        Self { user_service }
    }
}

fn to_proto_user(user: crate::domain::users::model::User) -> crate::proto::common::User {
    crate::proto::common::User {
        id: user.id.to_string(),
        email: user.email,
        email_verified: false,
        provider: "local".to_string(),
        provider_id: "".to_string(),
        created_at: user.created_at.timestamp_millis(),
        updated_at: user.updated_at.timestamp_millis(),
    }
}

#[tonic::async_trait]
impl UserService for UserServiceImpl {
    async fn create_user(
        &self,
        request: Request<CreateUserRequest>,
    ) -> Result<Response<CreateUserResponse>, Status> {
        let req = request.into_inner();

        let user = self
            .user_service
            .create_new_user(req.email, req.password, req.first_name, req.last_name)
            .map_err(|e| Status::internal(e.to_string()))?;

        Ok(Response::new(CreateUserResponse {
            user: Some(to_proto_user(user)),
        }))
    }

    async fn get_user(
        &self,
        request: Request<GetUserRequest>,
    ) -> Result<Response<GetUserResponse>, Status> {
        let req = request.into_inner();
        match self.user_service.get_user(&req.user_id) {
            Ok(Some(user)) => Ok(Response::new(GetUserResponse {
                user: Some(to_proto_user(user)),
            })),
            Ok(None) => Err(Status::not_found("User not found")),
            Err(e) => Err(Status::internal(e.to_string())),
        }
    }

    async fn update_user(
        &self,
        request: Request<UpdateUserRequest>,
    ) -> Result<Response<UpdateUserResponse>, Status> {
        let req = request.into_inner();
        if let Some(proto_user) = req.user {
            // Fetch existing domain user to update
            let user_id = &proto_user.id;
            let mut domain_user = match self.user_service.get_user(user_id) {
                Ok(Some(u)) => u,
                Ok(None) => {
                    return Err(Status::not_found("User not found"));
                }
                Err(e) => {
                    return Err(Status::internal(e.to_string()));
                }
            };

            // Update fields from proto user if present/changed
            if !proto_user.email.is_empty() {
                domain_user.email = proto_user.email.clone();
            }

            domain_user.updated_at = chrono::Utc::now();

            match self.user_service.update_user(domain_user.clone()) {
                Ok(true) => Ok(Response::new(UpdateUserResponse {
                    user: Some(to_proto_user(domain_user)),
                })),
                Ok(false) => Err(Status::not_found("User not found during update")),
                Err(e) => Err(Status::internal(e.to_string())),
            }
        } else {
            Err(Status::invalid_argument("User is required"))
        }
    }

    async fn delete_user(
        &self,
        request: Request<DeleteUserRequest>,
    ) -> Result<Response<DeleteUserResponse>, Status> {
        let req = request.into_inner();
        match self.user_service.delete_user(&req.user_id) {
            Ok(true) => Ok(Response::new(DeleteUserResponse {
                success: true,
                message: "User deleted".to_string(),
            })),
            Ok(false) => Err(Status::not_found("User not found")),
            Err(e) => Err(Status::internal(e.to_string())),
        }
    }
}
