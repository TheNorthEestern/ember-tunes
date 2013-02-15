require "./lib/init"

disable :logging
set :protection, :except => :frame_options
set :root, File.dirname(__FILE__) + "/../"

get "/" do
  File.readlines("public/index.html")
end

get "/old" do
  File.readlines("public/index.old.html")
end

get "/albums" do
  content_type "application/json"
  File.readlines("public/albums.json")
end

get "/favicon.ico" do
  ""
end

