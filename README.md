# IconVault - Mini Icon Catalog Website

This mini website allows you to host a reusable icon catalog for JSMmaker2, Jamf Setup Manager, or any other tool that expects image URLs.

The project is intentionally generic and customizable.
<img width="1518" height="1065" alt="IconVault" src="https://github.com/user-attachments/assets/cea1c07c-f9a1-4b7c-920f-b429c462868a" />

## Included Files

| File | Role | Needs adaptation depending on the domain? |
|---|---|---|
| `icons.html` | Main catalog page | Usually no, unless you want to modify visible texts. |
| `style.css` | Visual design of the site | Yes, if you want to change colors, border radius, typography or overall appearance. |
| `script.js` | Front-end logic: search, URL copy, upload, folder navigation | Rarely. URLs are now configured in `config.json`. |
| `config.json` | Main site configuration | Yes, this is the primary file to modify. |
| `list_icons.php` | PHP API listing icons from the `icons/` folder | No, unless advanced customization is required. |
| `upload.php` | PHP API handling drag & drop and uploads | No, unless advanced customization is required. |
| `icons/` | Folder containing publicly served icons | Yes, add your own icons here. |

## Domain Configuration

The most important file is `config.json`.

Example:

```json
{
  "siteTitle": "Icon Catalog",
  "studioName": "The Walkingbucket Studio",
  "baseUrl": "https://example.com/IconVault/",
  "apiListEndpoint": "list_icons.php",
  "apiUploadEndpoint": "upload.php",
  "allowedExtensions": ["png", "jpg", "jpeg"],
  "maxUploadSizeMB": 5,
  "allowUpload": true
}
```

### `baseUrl` Parameter

`baseUrl` must point to the public root of the catalog.

If the site is hosted here:

```text
https://yourdomain.com/jsmmaker-icons/
```

then you must configure:

```json
"baseUrl": "https://yourdomain.com/jsmmaker-icons/"
```

The system will automatically append the correct subfolder depending on the media type:

```text
icons/apps/
icons/banner/
icons/wallpaper/
icons/gallery/
```

Examples of automatically generated URLs:

```text
https://yourdomain.com/jsmmaker-icons/icons/apps/chrome.png
https://yourdomain.com/jsmmaker-icons/icons/banner/onboarding.jpg
https://yourdomain.com/jsmmaker-icons/icons/wallpaper/sonoma.jpg
```
## Installation on a Web Hosting Environment

1. Upload all files to the web server.
2. Ensure PHP is available.
3. Ensure the `icons/` folder exists.
4. Give the web server write permissions to the `icons/` folder if upload is enabled.
5. Modify `config.json` with the correct domain.
6. Open `icons.html` in a browser.

## Recommended Permissions

On a standard Linux server:

```bash
chmod 755 .
chmod 755 icons
```

If uploads do not work, you may need to adapt ownership of the `icons/` folder depending on the Apache, Nginx or PHP-FPM user.

Common example:

```bash
chown -R www-data:www-data icons
```

## Disable Uploads

To make the website read-only, modify `config.json`:

```json
"allowUpload": false
```

The drag & drop area will be hidden and `upload.php` will refuse uploads.

## Accepted Formats

By default:

```json
"allowedExtensions": ["png", "jpg", "jpeg"]
```

SVG support is intentionally disabled to reduce potential security risks related to browser-rendered SVG files.

## Visual Customization

Edit `style.css`.

The main variables are located at the top of the file:

```css
:root {
  --bg: #f8fafc;
  --surface: rgba(255, 255, 255, 0.78);
  --text: #0f172a;
  --muted: #64748b;
  --primary: #2563eb;
}
```

To change the visual identity, start with `--primary`, `--text`, `--bg`, and the contents of `config.json`.

## Text Customization

Main texts are located in `icons.html`.

You may want to modify:

- the presentation title
- the subtitle
- button labels
- the footer

The displayed studio name and short title are managed through `config.json`.

## Recommended Structure

```text
your-site/
├── icons.html
├── style.css
├── script.js
├── config.json
├── list_icons.php
├── upload.php
└── icons/
    ├── chrome.png
    ├── zoom.png
    └── office.png
```

## Integration with JSMmaker2

In JSMmaker2, use the icon catalog URL matching the `baseUrl` parameter.

Example:

```text
https://yourdomain.com/jsmmaker-icons/
```

Each click on a media item automatically copies its full URL, for example:

```text
https://yourdomain.com/jsmmaker-icons/icons/apps/chrome.png
```

This URL can then be pasted into JSMmaker2 icon, banner or wallpaper fields, or into a Jamf Setup Manager plist file.


## Bilingual FR / EN Interface
<img width="918" height="73" alt="Capture d’écran 2026-05-19 à 23 30 00" src="https://github.com/user-attachments/assets/5bc54a3e-11c8-44a7-8836-27e6e08ecbdd" />

The interface now includes a `FR / EN` language selector in the top-right corner.

Texts are managed in `script.js` inside the `translations` object.

The default language is configured in `config.json`:

```json
"defaultLanguage": "fr",
"availableLanguages": ["fr", "en"]
```

The site title can also be bilingual:

```json
"siteTitle": {
  "fr": "Catalogue d’icônes",
  "en": "Icon Catalog"
}
```

The selected language is stored in the browser using `localStorage`.

## Upload Protection with Authentication

<img width="1631" height="340" alt="Capture d’écran 2026-05-19 à 23 26 27" src="https://github.com/user-attachments/assets/c9ece9cb-f4de-46d0-9652-fbea150b15ba" />

The catalog remains public, but uploads require authentication.

| File | Role |
|---|---|
| `login.php` | Login form |
| `logout.php` | Logout handler |
| `auth.php` | Session validation |
| `auth_config.php` | Credentials and password hash |
| `auth_status.php` | Checks whether the user is authenticated |
![Uploading Capture d’écran 2026-05-19 à 23.26.56.png…]()

<img width="906" height="157" alt="Capture d’écran 2026-05-19 à 23 26 56" src="https://github.com/user-attachments/assets/26365dda-a920-429a-bc07-a8efcef597d9" />

### IMPORTANT

Never leave a plain-text password inside files.

Immediately edit:

```php
auth_config.php
```

## Generate a Secure Password Hash

The `generate.php` file is a temporary helper used to generate a password hash compatible with `password_verify()`.

1. Open the `generate.php` file.
2. Modify this line with your plain-text password:

```php
<?php
 echo password_hash('YourUltraStrongPassword', PASSWORD_DEFAULT);
```

Example:

```php
<?php
 echo password_hash('MyUltraSecurePassword2026!', PASSWORD_DEFAULT);
```

3. Temporarily upload the `generate.php` file to your web server.

Example:

```text
https://yourdomain.com/generate.php
```

4. Open this URL in a browser.
5. Copy the generated hash displayed on screen.
6. Paste this hash into `auth_config.php`:

```php
'password_hash' => 'PASTE_HASH_HERE'
```

### IMPORTANT

The `generate.php` file is intended for temporary use only.

Once the hash has been generated and copied into `auth_config.php`, immediately delete `generate.php` from the hosting environment.

Never leave this file publicly accessible on the Internet.

### Modify the Login Username

```php
'username' => 'your_login'
```

### How It Works

- Visitors can view the icons.
- Only authenticated users can access the upload area.
- `upload.php` automatically rejects unauthenticated uploads.

## Disclaimer

Application names, logos, trademarks and icons used in this project remain the property of their respective owners.

This project only provides a self-hosted icon catalog system and does not claim ownership of any third-party trademarks, visual identities or graphic assets.

Users of this project are responsible for ensuring they have the necessary rights to host, use and redistribute the icons they add to the catalog.
