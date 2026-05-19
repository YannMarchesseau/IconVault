# IconVault - Mini site de gestion d’icônes

Site de démo : https://walkingbucket.fr/JSM-IconCatalogue/icons.html

Ce mini site permet d’héberger un catalogue d’icônes réutilisable dans JSMmaker2, Jamf Setup Manager ou tout autre outil qui attend des URLs d’images.
Le site est volontairement générique et personnalisable.

<img width="1518" height="1065" alt="IconVault" src="https://github.com/user-attachments/assets/cea1c07c-f9a1-4b7c-920f-b429c462868a" />

## Fichiers inclus

| Fichier | Rôle | À adapter selon le domaine ? |
|---|---|---|
| `icons.html` | Page principale du catalogue | Généralement non, sauf si vous voulez modifier les textes visibles. |
| `style.css` | Design visuel du site | Oui, si vous voulez changer couleurs, arrondis, typographie ou apparence globale. |
| `script.js` | Logique front-end : recherche, copie URL, upload, navigation dossiers | Rarement. Les URLs sont désormais dans `config.json`. |
| `config.json` | Configuration principale du site | Oui, c’est le fichier principal à modifier. |
| `list_icons.php` | API PHP qui liste les icônes dans le dossier `icons/` | Non, sauf besoin avancé. |
| `upload.php` | API PHP qui gère le glisser-déposer et l’envoi des fichiers | Non, sauf besoin avancé. |
| `icons/` | Dossier contenant les icônes servies publiquement | Oui, ajoutez vos icônes ici. |

## Configuration du domaine

Le fichier le plus important est `config.json`.

Exemple :

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


### Paramètre `baseUrl`

`baseUrl` doit pointer vers le dossier public contenant les icônes.

Si le site est hébergé ici :

```text
https://mondomaine.fr/jsmmaker-icons/
```

alors il faut configurer :

```json
"baseUrl": "https://mondomaine.fr/jsmmaker-icons/"
```

Le système ajoutera automatiquement le bon sous-dossier selon le type de média utilisé :

```text
icons/apps/
icons/banner/
icons/wallpaper/
icons/gallery/
```

Exemples d’URLs générées automatiquement :

```text
https://mondomaine.fr/jsmmaker-icons/icons/apps/chrome.png
https://mondomaine.fr/jsmmaker-icons/icons/banner/onboarding.jpg
https://mondomaine.fr/jsmmaker-icons/icons/wallpaper/sonoma.jpg
```


## Installation sur un hébergement web

1. Envoyer tous les fichiers sur le serveur web.
2. Vérifier que PHP est disponible.
3. Vérifier que le dossier `icons/` existe.
4. Donner au serveur web le droit d’écriture sur le dossier `icons/` si l’upload est activé.
5. Modifier `config.json` avec le bon domaine.
6. Ouvrir `icons.html` dans un navigateur.

## Droits recommandés

Sur un serveur Linux classique :

```bash
chmod 755 .
chmod 755 icons
```

Si l’upload ne fonctionne pas, il faudra peut-être adapter le propriétaire du dossier `icons/` selon l’utilisateur utilisé par Apache, Nginx ou PHP-FPM.

Exemple fréquent :

```bash
chown -R www-data:www-data icons
```

## Désactiver l’upload

Pour rendre le site consultable uniquement, modifier `config.json` :

```json
"allowUpload": false
```

La zone de glisser-déposer sera masquée, et `upload.php` refusera les envois.

## Formats acceptés

Par défaut :

```json
"allowedExtensions": ["png", "jpg", "jpeg"]
```

Le SVG n’est pas activé volontairement pour éviter certains risques de sécurité liés aux fichiers SVG servis directement par un navigateur.

## Personnalisation graphique

Modifier `style.css`.

Les principales variables sont en haut du fichier :

```css
:root {
  --bg: #f8fafc;
  --surface: rgba(255, 255, 255, 0.78);
  --text: #0f172a;
  --muted: #64748b;
  --primary: #2563eb;
}
```

Pour changer l’identité visuelle, commencez par `--primary`, `--text`, `--bg` et le contenu de `config.json`.

## Personnalisation des textes

Les textes principaux sont dans `icons.html`.

À modifier éventuellement :

- le titre de présentation
- le sous-titre
- les libellés des boutons
- le footer

Le nom affiché du studio et le titre court sont pilotés par `config.json`.

## Structure recommandée

```text
votre-site/
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

## Intégration avec JSMmaker2

Dans JSMmaker2, utilisez l’URL du catalogue d’icônes correspondant au paramètre `baseUrl`.

Exemple :

```text
https://mondomaine.fr/jsmmaker-icons/
```

Chaque clic sur un média copie automatiquement son URL complète, par exemple :

```text
https://mondomaine.fr/jsmmaker-icons/icons/apps/chrome.png
```

Cette URL peut ensuite être collée dans les champs d’icône, de bannière ou de fond d’écran de JSMmaker2 ou dans un fichier plist Jamf Setup Manager.



## Interface bilingue FR / EN

<img width="918" height="73" alt="Capture d’écran 2026-05-19 à 23 30 00" src="https://github.com/user-attachments/assets/ce9a9e16-73cd-4ce9-b92b-754c7af06c59" />

L’interface dispose d’un sélecteur `FR / EN` en haut à droite.

Les textes sont gérés dans `script.js`, dans l’objet `translations`.

La langue par défaut est définie dans `config.json` :

```json
"defaultLanguage": "fr",
"availableLanguages": ["fr", "en"]
```

Le titre du site peut aussi être bilingue :

```json
"siteTitle": {
  "fr": "Catalogue d’icônes",
  "en": "Icon Catalog"
}
```

La langue choisie par l’utilisateur est mémorisée dans le navigateur via `localStorage`.


## Protection de l’upload par connexion

<img width="1631" height="340" alt="Capture d’écran 2026-05-19 à 23 26 27" src="https://github.com/user-attachments/assets/be24dc04-2ca8-4233-8c87-153febe3fef5" />

Le catalogue reste public, mais l’upload nécessite maintenant une authentification.

### Fichiers ajoutés

| Fichier | Rôle |
|---|---|
| `login.php` | Formulaire de connexion |
| `logout.php` | Déconnexion |
| `auth.php` | Vérification de session |
| `auth_config.php` | Identifiants et mot de passe hashé |
| `auth_status.php` | Vérifie si l’utilisateur est connecté |

<img width="906" height="157" alt="Capture d’écran 2026-05-19 à 23 26 56" src="https://github.com/user-attachments/assets/13bb212f-a998-41b4-ad5d-31b8bee96a8f" />

### IMPORTANT

Ne laissez jamais un mot de passe en clair dans les fichiers.

Modifier immédiatement :

```php
auth_config.php
```

### Générer un hash sécurisé

Le fichier `generate.php` est un fichier temporaire permettant de générer un mot de passe hashé compatible avec `password_verify()`.

1. Ouvrir le fichier `generate.php`.
2. Modifier cette ligne avec votre mot de passe en clair :

```php
<?php
 echo password_hash('VotreMotDePasseUltraFort', PASSWORD_DEFAULT);
```

Exemple :

```php
<?php
 echo password_hash('MonMotDePasseUltraSecurise2026!', PASSWORD_DEFAULT);
```

3. Héberger temporairement le fichier `generate.php` sur votre serveur web.

Exemple :

```text
https://mondomaine.fr/generate.php
```

4. Ouvrir cette URL dans un navigateur.
5. Copier le hash généré affiché à l’écran.
6. Coller ce hash dans `auth_config.php` :

```php
'password_hash' => 'COLLER_LE_HASH_ICI'
```

### IMPORTANT

Le fichier `generate.php` est uniquement destiné à une utilisation temporaire.

Une fois le hash généré et copié dans `auth_config.php`, supprimer immédiatement `generate.php` de l’hébergement.

Ne jamais laisser ce fichier accessible publiquement sur Internet.

### Modifier le login

```php
'username' => 'votre_login'
```


### Fonctionnement

- Les visiteurs peuvent voir les icônes.
- Seuls les utilisateurs connectés voient la zone d’upload.
- `upload.php` refuse automatiquement les uploads non authentifiés.

## Mentions légales

Les noms d’applications, logos, marques et icônes utilisés dans ce projet restent la propriété de leurs propriétaires respectifs.

Ce projet fournit uniquement un système auto-hébergé de catalogue d’icônes et ne revendique aucun droit de propriété sur les marques, identités visuelles ou ressources graphiques tierces.

Les utilisateurs du projet sont responsables de vérifier qu’ils disposent des droits nécessaires pour héberger, utiliser et redistribuer les icônes qu’ils ajoutent au catalogue.
