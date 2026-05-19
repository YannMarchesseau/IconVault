document.addEventListener('DOMContentLoaded', async () => {
  const uploadArea = document.getElementById('upload-area');
  const iconList = document.getElementById('icon-list');
  const folderList = document.getElementById('folder-list');
  const searchInput = document.getElementById('search-input');
  const statusMessage = document.getElementById('status-message');
  const progressBar = document.getElementById('progress-bar');
  const emptyState = document.getElementById('empty-state');
  const iconCount = document.getElementById('icon-count');
  const currentPathLabel = document.getElementById('current-path-label');
  const backButton = document.getElementById('back-button');
  const refreshButton = document.getElementById('refresh-button');
  const copyBaseButton = document.getElementById('copy-base-button');
  const iconTemplate = document.getElementById('icon-template');
  const languageButtons = document.querySelectorAll('.lang-button');

  let currentDirectory = '';
  let currentLanguage = localStorage.getItem('iconCatalogLanguage') || 'fr';

  let config = {
    siteTitle: {
      fr: 'Catalogue d’icônes',
      en: 'Icon Catalog'
    },
    studioName: 'The Walkingbucket Studio',
    defaultLanguage: 'fr',
    availableLanguages: ['fr', 'en'],
    baseUrl: `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, '')}icons/`,
    apiListEndpoint: 'list_icons.php',
    apiUploadEndpoint: 'upload.php',
    allowedExtensions: ['png', 'jpg', 'jpeg', 'webp'],
    allowUpload: true
  };

  const translations = {
    fr: {
      refreshButton: 'Rafraîchir',
      copyCatalogButton: 'Copier l’URL du catalogue',
      heroTitle: 'Un catalogue d’icônes simple, rapide et personnalisable.',
      heroDescription: 'Glissez vos icônes, recherchez-les instantanément, puis copiez leur URL pour les utiliser dans vos workflows d’onboarding, vos fichiers plist ou vos outils internes.',
      searchLabel: 'Rechercher une icône',
      searchPlaceholder: 'Ex. chrome, zoom, office, printer...',
      dropTitle: 'Glissez-déposez vos icônes ici',
      uploadHelp: 'Formats acceptés : {formats}',
      foldersTitle: 'Dossiers',
      backButton: 'Retour',
      availableIconsEyebrow: 'Icônes disponibles',
      rootCatalog: 'Racine du catalogue',
      folderPath: 'Dossier : {folder}',
      iconCountSingular: '1 icône',
      iconCountPlural: '{count} icônes',
      noFolder: 'Aucun dossier.',
      emptyTitle: 'Aucune icône trouvée',
      emptyDescription: 'Ajoutez des fichiers dans le dossier icons/ ou utilisez le glisser-déposer.',
      copyUrlButton: 'Copier l’URL',
      copiedUrl: 'URL copiée : {url}',
      copiedCatalogUrl: 'URL du catalogue copiée : {url}',
      invalidFiles: 'Aucun fichier valide. Formats autorisés : {formats}',
      uploadSuccessSingular: '1 fichier ajouté.',
      uploadSuccessPlural: '{count} fichiers ajoutés.',
      uploadError: 'Erreur pendant l’envoi des fichiers.',
      loadError: 'Erreur lors du chargement des icônes.',
      footerBaseline: 'Réutilisable, configurable et prêt pour l’auto-hébergement.'
    },
    en: {
      refreshButton: 'Refresh',
      copyCatalogButton: 'Copy catalog URL',
      heroTitle: 'A simple, fast and customizable icon catalog.',
      heroDescription: 'Drag your icons, search them instantly, then copy their URL for onboarding workflows, plist files or internal tools.',
      searchLabel: 'Search an icon',
      searchPlaceholder: 'E.g. chrome, zoom, office, printer...',
      dropTitle: 'Drag and drop your icons here',
      uploadHelp: 'Accepted formats: {formats}',
      foldersTitle: 'Folders',
      backButton: 'Back',
      availableIconsEyebrow: 'Available icons',
      rootCatalog: 'Catalog root',
      folderPath: 'Folder: {folder}',
      iconCountSingular: '1 icon',
      iconCountPlural: '{count} icons',
      noFolder: 'No folder.',
      emptyTitle: 'No icon found',
      emptyDescription: 'Add files to the icons/ folder or use drag and drop.',
      copyUrlButton: 'Copy URL',
      copiedUrl: 'URL copied: {url}',
      copiedCatalogUrl: 'Catalog URL copied: {url}',
      invalidFiles: 'No valid file. Allowed formats: {formats}',
      uploadSuccessSingular: '1 file added.',
      uploadSuccessPlural: '{count} files added.',
      uploadError: 'Error while uploading files.',
      loadError: 'Error while loading icons.',
      footerBaseline: 'Reusable, configurable and ready for self-hosting.'
    }
  };

  function t(key, values = {}) {
    const dictionary = translations[currentLanguage] || translations.fr;
    let text = dictionary[key] || translations.fr[key] || key;

    Object.entries(values).forEach(([name, value]) => {
      text = text.replace(`{${name}}`, value);
    });

    return text;
  }

  function localizedConfigValue(value, fallback = '') {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
      return value[currentLanguage] || value.fr || value.en || fallback;
    }
    return fallback;
  }


  async function updateAuthenticationUI() {
    try {
      const response = await fetch('auth_status.php', { cache: 'no-store' });
      const data = await response.json();

      const logoutButton = document.createElement('button');
      logoutButton.className = 'secondary-button';
      logoutButton.textContent = currentLanguage === 'fr' ? 'Déconnexion' : 'Logout';
      logoutButton.onclick = () => window.location.href = 'logout.php';

      if (!data.authenticated) {
        uploadArea.style.display = 'none';

        const loginButton = document.createElement('button');
        loginButton.className = 'primary-button';
        loginButton.textContent = currentLanguage === 'fr' ? 'Connexion Upload' : 'Upload Login';
        loginButton.onclick = () => window.location.href = 'login.php';

        document.querySelector('.toolbar').prepend(loginButton);
      } else {
        uploadArea.style.display = 'flex';
        document.querySelector('.toolbar').prepend(logoutButton);
      }
    } catch (error) {
      console.error(error);
    }
  }


  async function loadConfig() {
    try {
      const response = await fetch('config.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('config.json introuvable');
      const remoteConfig = await response.json();
      config = { ...config, ...remoteConfig };
    } catch (error) {
      console.warn('Configuration par défaut utilisée:', error);
    }

    if (!config.availableLanguages.includes(currentLanguage)) {
      currentLanguage = config.defaultLanguage || 'fr';
    }

    if (!config.allowUpload) {
      uploadArea.style.display = 'none';
    }

    applyLanguage();
  }

  function applyLanguage() {
    document.documentElement.lang = currentLanguage;

    const siteTitle = localizedConfigValue(config.siteTitle, 'Icon Catalog');
    document.title = siteTitle;
    document.getElementById('site-title').textContent = siteTitle;
    document.getElementById('footer-site-title').textContent = siteTitle;
    document.getElementById('studio-name').textContent = config.studioName;
    document.getElementById('footer-studio-name').textContent = config.studioName;
    document.getElementById('upload-help').textContent = t('uploadHelp', { formats: config.allowedExtensions.map(ext => ext.toUpperCase()).join(', ') });

    document.querySelectorAll('[data-i18n]').forEach(element => {
      element.textContent = t(element.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });

    languageButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.language === currentLanguage);
    });

    updatePathLabel();
    updateIconCount(iconList.children.length);
  }

  function normalizeBaseUrl(url) {
    return url.endsWith('/') ? url : `${url}/`;
  }

  function iconUrl(fileName) {
    const baseUrl = normalizeBaseUrl(config.baseUrl);
    return `${baseUrl}${currentDirectory ? `${currentDirectory}/` : ''}${fileName}`;
  }

  async function copyToClipboard(text, isCatalogUrl = false) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const tempInput = document.createElement('input');
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
    }

    setStatus(isCatalogUrl ? t('copiedCatalogUrl', { url: text }) : t('copiedUrl', { url: text }), 'success');
  }

  function setStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.dataset.type = type;
    if (message) {
      window.setTimeout(() => {
        if (statusMessage.textContent === message) statusMessage.textContent = '';
      }, 5000);
    }
  }

  function updatePathLabel() {
    currentPathLabel.textContent = currentDirectory ? t('folderPath', { folder: currentDirectory }) : t('rootCatalog');
    backButton.disabled = !currentDirectory;
  }

  function updateIconCount(count) {
    iconCount.textContent = count === 1 ? t('iconCountSingular') : t('iconCountPlural', { count });
  }

  function renderFolders(directories) {
    folderList.innerHTML = '';

    if (!directories.length) {
      const empty = document.createElement('p');
      empty.className = 'status-message';
      empty.textContent = t('noFolder');
      folderList.appendChild(empty);
      return;
    }

    directories.forEach(directory => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'folder-item';
      button.innerHTML = `<span>📁</span><span>${directory}</span>`;
      button.addEventListener('click', () => {
        currentDirectory = directory;
        loadIcons();
      });
      folderList.appendChild(button);
    });
  }

  function renderIcons(files, filter) {
    iconList.innerHTML = '';

    const filteredFiles = files.filter(file => file.toLowerCase().includes(filter.toLowerCase()));
    updateIconCount(filteredFiles.length);
    emptyState.style.display = filteredFiles.length ? 'none' : 'block';

    filteredFiles.forEach(file => {
      const node = iconTemplate.content.cloneNode(true);
      const card = node.querySelector('.icon-card');
      const preview = node.querySelector('.icon-preview');
      const image = node.querySelector('img');
      const name = node.querySelector('.icon-name');
      const copyButton = node.querySelector('.copy-button');
      const url = iconUrl(file);

      image.src = url;
      image.alt = file;
      name.textContent = file;
      copyButton.textContent = t('copyUrlButton');
      preview.title = t('copyUrlButton');
      preview.addEventListener('click', () => copyToClipboard(url));
      copyButton.addEventListener('click', () => copyToClipboard(url));

      iconList.appendChild(card);
    });
  }

  async function loadIcons() {
    const filter = searchInput.value.trim();

    try {
      const endpoint = `${config.apiListEndpoint}?directory=${encodeURIComponent(currentDirectory)}`;
      const response = await fetch(endpoint, { cache: 'no-store' });
      if (!response.ok) throw new Error('Impossible de charger le catalogue');

      const data = await response.json();
      updatePathLabel();

      renderFolders(data.directories || []);
      renderIcons(data.files || [], filter);
    } catch (error) {
      console.error(error);
      setStatus(t('loadError'), 'error');
    }
  }

  function hasValidExtension(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    return config.allowedExtensions.includes(extension);
  }

  async function uploadFiles(files) {
    if (!config.allowUpload) return;

    const validFiles = [...files].filter(hasValidExtension);

    if (!validFiles.length) {
      setStatus(t('invalidFiles', { formats: config.allowedExtensions.join(', ') }), 'error');
      return;
    }

    const formData = new FormData();
    validFiles.forEach(file => formData.append('file[]', file));

    progressBar.style.display = 'block';
    progressBar.removeAttribute('value');

    try {
      const response = await fetch(config.apiUploadEndpoint, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      const successCount = data.filter(item => item.status === 'success').length;
      setStatus(successCount === 1 ? t('uploadSuccessSingular') : t('uploadSuccessPlural', { count: successCount }), successCount ? 'success' : 'error');
      await loadIcons();
    } catch (error) {
      console.error(error);
      setStatus(t('uploadError'), 'error');
    } finally {
      progressBar.style.display = 'none';
    }
  }

  uploadArea.addEventListener('dragover', event => {
    event.preventDefault();
    uploadArea.classList.add('dragging');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragging');
  });

  uploadArea.addEventListener('drop', event => {
    event.preventDefault();
    uploadArea.classList.remove('dragging');
    uploadFiles(event.dataTransfer.files);
  });

  searchInput.addEventListener('input', loadIcons);

  backButton.addEventListener('click', () => {
    currentDirectory = '';
    loadIcons();
  });

  refreshButton.addEventListener('click', loadIcons);
  copyBaseButton.addEventListener('click', () => copyToClipboard(normalizeBaseUrl(config.baseUrl), true));

  languageButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentLanguage = button.dataset.language;
      localStorage.setItem('iconCatalogLanguage', currentLanguage);
      applyLanguage();
      loadIcons();
    });
  });

  await loadConfig();
  await updateAuthenticationUI();
  await loadIcons();
});
