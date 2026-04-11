Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"

  # YOUR router.js equivalent:
  # router.get('/', fn)           → get  "/",            to: "pages#home"
  # router.get('/about', fn)      → get  "/about",       to: "pages#about"
  # router.post('/create-user', fn) → post "/create-user", to: "users#create"
  get  "/",            to: "pages#home"
  get  "/about",       to: "pages#about"
  post "/create-user", to: "users#create"

  # YOUR router.js equivalent:
  # const pathExists = this.routes.some(r => r.path === path)
  # return { handler: null, methodNotAllowed: pathExists }
  # Path exists but wrong method → 405
  match "/",            to: "application#method_not_allowed", via: [:post, :put, :patch, :delete]
  match "/about",       to: "application#method_not_allowed", via: [:post, :put, :patch, :delete]
  match "/create-user", to: "application#method_not_allowed", via: [:get, :put, :patch, :delete]

  # YOUR router.js equivalent:
  # else branch in resolve() — nothing matched, return 404
  # Must be LAST — Rails matches top to bottom, first match wins
  match '*unmatched', to: 'application#not_found', via: :all
end
