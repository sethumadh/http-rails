class UsersController < ApplicationController
  # YOUR Node.js equivalent:
  # router.post('/create-user', () => buildResponse(201, { message: 'User created' }))
  def create
    render json: { message: 'User created' }, status: :created
  end
end
