use std::sync::Arc;
use tonic::{Request, Response, Status};
use crate::proto::ledger::*;
use crate::proto::ledger::user_service_server::UserService;
use crate::domain::users::UserService as UserDomainService;

pub struct UserServiceImpl {
    user_service: Arc<UserDomainService>,
}

impl UserServiceImpl {
    pub fn new(user_service: Arc<UserDomainService>) -> Self {
        Self { user_service }
    }
}

#[tonic::async_trait]
impl UserService for UserServiceImpl {
    async fn create_user(
        &self,
        request: Request<CreateUserRequest>,
    ) -> Result<Response<CreateUserResponse>, Status> {
        let req = request.into_inner();
        
        let user = self.user_service.create_new_user(
            req.email,
            req.password,
            req.first_name,
            req.last_name,
        );

        Ok(Response::new(CreateUserResponse {
            user: Some(user),
        }))
    }

    async fn get_user(
        &self,
        request: Request<GetUserRequest>,
    ) -> Result<Response<GetUserResponse>, Status> {
        let req = request.into_inner();
        if let Some(user) = self.user_service.get_user(&req.user_id) {
                Ok(Response::new(GetUserResponse {
                    user: Some(user),
                }))
        } else {
                Err(Status::not_found("User not found"))
        }
    }

    async fn update_user(
        &self,
        request: Request<UpdateUserRequest>,
    ) -> Result<Response<UpdateUserResponse>, Status> {
        let req = request.into_inner();
        if let Some(user) = req.user {
                if self.user_service.update_user(user.clone()) {
                    Ok(Response::new(UpdateUserResponse {
                        user: Some(user),
                    }))
                } else {
                    Err(Status::not_found("User not found"))
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
        if self.user_service.delete_user(&req.user_id) {
                Ok(Response::new(DeleteUserResponse {
                    success: true,
                    message: "User deleted".to_string(),
                }))
        } else {
                Err(Status::not_found("User not found"))
        }
    }
}
