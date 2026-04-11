class ApplicationController < ActionController::API
  # YOUR server.js equivalent:
  # catch (err) { buildResponse(500, ERROR_RESPONSES[500]) }
  rescue_from StandardError do
    render json: { error: 'Internal Server Error' }, status: :internal_server_error
  end

  # YOUR router.js equivalent:
  # } else { buildResponse(404, ERROR_RESPONSES[404]) }
  # Called by the catch-all route: match '*unmatched', via: :all
  def not_found
    render json: { error: 'Not Found' }, status: :not_found
  end
end
