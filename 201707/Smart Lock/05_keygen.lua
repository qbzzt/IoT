secret = "hello"
key = secret

for i=0,5 do
   key = crypto.toBase64(crypto.hash("sha1", key))
   print ("Key #" .. i .. " is " .. key)
end

storeMe = crypto.toBase64(crypto.hash("sha1", key))

print ("Store this value: " .. storeMe)

