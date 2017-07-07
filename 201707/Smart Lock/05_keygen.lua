secret = "hello"
keyNum = 5

key = secret

for i=1,5 do
   key = crypto.toHex(crypto.hash("sha1", key))
   print ("Key #" .. i .. " is " .. key)
end

storeMe = crypto.toHex(crypto.hash("sha1", key))

fd = file.open("authkey", "w+")
fd:write(storeMe)
fd:close()

fd = file.open("keynum", "w+")
fd:write(keyNum)
fd:close()


-- Expected output (when the secret is "hello")
-- Key #1 is aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d
-- Key #2 is 9cf5caf6c36f5cccde8c73fad8894c958f4983da
-- Key #3 is 1eec5eecf3ddf2d401205eb87055d6595a9bceaf
-- Key #4 is 63f438b065e9e9358275ab785bbaa9913bc4d894
-- Key #5 is 23f340d0cff31e299158b3181b6bcc7e8c7f985a
