class PagesController < ApplicationController
  # YOUR Node.js equivalent:
  # router.get('/', () => buildResponse(200, { message: 'Welcome to the home page' }))
  def home
    render json: { message: 'Welcome to the home page' }, status: :ok
  end

  # YOUR Node.js equivalent:
  # router.get('/about', () => buildResponse(200, { message: 'This is the about page' }))
  def about
    render json: { message: 'This is the about page' }, status: :ok
  end
end
