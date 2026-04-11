class UsersController < ApplicationController
  # YOUR Node.js equivalent:
  # router.post('/create-user', () => buildResponse(201, { message: 'User created' }))
  def create
      name  = params[:name]  # read name from body
      email = params[:email]  # read email from body
    render json: { message: "User #{name} created", email: email }, status: :created
  end
end
