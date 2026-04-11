class UsersController < ApplicationController
  # YOUR Node.js equivalent:
  # router.post('/create-user', () => buildResponse(201, { message: 'User created' }))
  def create
    # YOUR parseRequest.js equivalent — Rails provides these automatically
    name         = params[:name]                        # from body
    email        = params[:email]                       # from body
    content_type = request.headers['Content-Type']      # from headers

    render json: {
      message:      "User #{name} created",
      email:        email,
      content_type: content_type
    }, status: :created
  end
end
