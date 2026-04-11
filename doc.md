No framework magic — the net module gives you a raw TCP socket. HTTP doesn't exist yet. You manually call chunk.toString() and split on \r\n and \r\n\r\n — those are the actual HTTP wire delimiters.
parseRequest — the blank line (\r\n\r\n) is literally how HTTP separates headers from body. Rails/Express hide this entirely.
buildResponse — you're writing the status line, headers, and body yourself. Content-Length must be exact or the client hangs waiting for more bytes.
socket.write + socket.end() — write the response bytes, then close the connection. Without end(), curl hangs.