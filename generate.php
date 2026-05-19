<?php
// Temporary helper file.
// Rename to generate.php only when you need to generate a password hash.
// Delete it from the server immediately after use.

echo password_hash('CHANGE_ME_STRONG_PASSWORD', PASSWORD_DEFAULT);
