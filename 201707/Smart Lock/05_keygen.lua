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
fd:close()


-- Expected output (when the secret is "hello")
-- Key #1 is qvTGHdzF6KLavt4PO0gs2a6pQ00=
-- Key #2 is IgecUlSsmESIph6OzuOQswRIH9o=
-- Key #3 is xZLg+fGiXRYG/jFRJFCF1/5YehY=
-- Key #4 is lgJa/7lWrpTi7Fbl+Lss1J8ZEck=
-- Key #5 is I7hEnawpXe2uKKVUDjcGj8f8zPw=

   
