secret = "hello"
keyNum = 5

key = secret

for i=1,5 do
   key = crypto.toBase64(crypto.hash("sha1", key))
   print ("Key #" .. i .. " is " .. key)
end

storeMe = crypto.toBase64(crypto.hash("sha1", key))

fd = file.open("authkey", "w+")
fd:write(storeMe)
fd:close()

fd = file.open("keynum", "w+")
fd:write(keyNum)
fd:close
   
