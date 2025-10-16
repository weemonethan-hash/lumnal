let apps = []; 
let openWindows = {}; 
let appPositions = {}; 
let zIndex = 1000;
let fileSystem = {}; 
let currentPath = '/'; 
let openTabs = []; 
let activeTab = null; 
let terminalHistory = [];
let contextMenuTarget = null;
let originalTitle = document.title;
let originalFavicon = document.querySelector("link[rel~='icon']") ? document.querySelector("link[rel~='icon']").href : '/favicon.png';
let lastTap = 0;

const masterAppConfig = [
    { name: "Paint", icon: "fa-solid fa-palette", type: 'action', content: 'openPaint', pinned: true, pinnedToTaskbar: false },
    { name: "AI", icon: "fa-solid fa-robot", type: 'proxied_url', content: 'https://duckduckgo.com/?q=e&ia=chat&duckai=1', pinned: true, pinnedToTaskbar: false},
    { name: "Soundboard", icon: "fa-solid fa-volume-high", type: 'proxied_url', content: 'https://soundbuttonsworld.com/', pinned: true, pinnedToTaskbar: false},
    { name: "Emulator", icon: "fa-solid fa-gamepad", type: 'proxied_url', content: 'https://astroid.gg/worksheets/emuindex.html', pinned: false, pinnedToTaskbar: false},
    { name: "Movies", icon: "fa-solid fa-film", type: 'proxied_url', content: 'https://sflix.fi/home/', pinned: true, pinnedToTaskbar: false},
    { name: "Site Chat", icon: "fa-brands fa-discord", type: 'proxied_url', content: 'https://e.widgetbot.io/channels/1353431019599953920/1406433974531653652', pinned: true, pinnedToTaskbar: false},
    { name: "Youtube", icon: "fa-brands fa-youtube", type: 'proxied_url', content: 'https://inv.nadeko.net/', pinned: true, pinnedToTaskbar: false},
    { name: "Settings", icon: "fa-solid fa-gear", type: 'action', content: 'openSettings', pinned: true, pinnedToTaskbar: true },
    { name: "Theme Builder", icon: "fa-solid fa-brush", type: 'action', content: 'openThemeBuilder', pinned: true, pinnedToTaskbar: false },
    { name: "App Creator", icon: "fa-solid fa-wand-magic-sparkles", type: 'action', content: 'openAppCreator', pinned: true, pinnedToTaskbar: false },
    { name: "Notes", icon: "fa-solid fa-note-sticky", type: 'action', content: 'openNotes', pinned: false, pinnedToTaskbar: false },
    { name: "About", icon: "fa-solid fa-circle-info", type: 'action', content: 'openAbout', pinned: true, pinnedToTaskbar: false },
    { name: "Tiktok", icon: "fa-brands fa-tiktok", type: 'proxied_url', content: 'https://tiktok.com/', pinned: true, pinnedToTaskbar: false},
    { name: "JS Executor", icon: "fa-brands fa-js-square", type: 'action', content: 'openJSExecutor', pinned: true, pinnedToTaskbar: false },
    { name: "Python Executor", icon: "fa-brands fa-python", type: 'action', content: 'openPythonExecutor', pinned: true, pinnedToTaskbar: false },
    { name: "Minecraft", icon: "https://cdn.jsdelivr.net/gh/gn-math/covers@main/182.png", type: 'action', content: 'openMinecraft', pinned: true, pinnedToTaskbar: false, isGame: true },
    { name: "Undertale", icon: "https://cdn.jsdelivr.net/gh/gn-math/covers@main/184.png", type: 'iframe', content: 'pinned/undertale/index.html', pinned: true, pinnedToTaskbar: false, isGame: true },
    { name: "Deltarune", icon: "https://cdn.jsdelivr.net/gh/gn-math/covers@main/425.png", type: 'iframe', content: 'pinned/deltarune/index.html', pinned: true, pinnedToTaskbar: false, isGame: true },
    { name: "G@mes", icon: "fa-solid fa-gamepad", type: 'action', content: 'openG3meLibrary', pinned: true, pinnedToTaskbar: true },
    { name: "Browser", icon: "fa-solid fa-globe", type: 'action', content: 'openBrowser', pinned: true, pinnedToTaskbar: true },
    { name: "Music", icon: "fa-solid fa-music", type: 'proxied_url', content: 'https://soundcloud.com', pinned: true, pinnedToTaskbar: true },
    { name: "File Explorer", icon: "fa-solid fa-folder", type: 'action', content: 'openFileExplorer', pinned: true, pinnedToTaskbar: true },
  //  { name: "Collab Space", icon: "fa-solid fa-users", type: 'action', content: 'openCollabSpace', pinned: true, pinnedToTaskbar: false }
];

function initFileSystem() {
    const saved = localStorage.getItem('luminal_filesystem');
    if (saved) { 
        fileSystem = JSON.parse(saved); 
    } else {
        fileSystem = {
            '/': { 
                type: 'folder', 
                children: { 
                    'Documents': { 
                        type: 'folder', 
                        children: { 
                            'welcome.txt': { 
                                type: 'file', 
                                content: 'Welcome to luminalOS File System!\n\nThis is a virtual filesystem stored in your browser.\n\nYou can:\n- Create folders and files\n- Upload files from your computer\n- Edit text files with Monaco Editor\n- Download files\n\nAll your files are stored locally in your browser.\nMax storage: 5GB',
                                size: 0,
                                modified: new Date().toISOString()
                            }
                        }
                    }, 
                    'Pictures': { type: 'folder', children: {} }, 
                    'Downloads': { type: 'folder', children: {} },
                    'Projects': { 
                        type: 'folder', 
                        children: { 
                            'hello.js': { 
                                type: 'file', 
                                content: 'console.log("Hello, luminalOS!");',
                                size: 0,
                                modified: new Date().toISOString()
                            }, 
                            'style.css': { 
                                type: 'file', 
                                content: 'body { background: #f0f0f0; }',
                                size: 0,
                                modified: new Date().toISOString()
                            }
                        }
                    }, 
                    'System': { type: 'folder', children: {} }
                }
            }
        };
        saveFileSystem();
    }
}

function saveFileSystem() { 
    try {
        const serialized = JSON.stringify(fileSystem);
        const sizeInMB = new Blob([serialized]).size / (1024 * 1024);
        if (sizeInMB > 5120) {
            alert('File system exceeds 5GB limit!');
            return;
        }
        localStorage.setItem('luminal_filesystem', serialized);
    } catch (e) {
        alert('Failed to save filesystem: ' + e.message);
    }
}

function getNodeAtPath(path) { 
    if (path === '/') return fileSystem['/'];
    const parts = path.split('/').filter(p => p);
    let node = fileSystem['/'];
    for (const part of parts) {
        if (node.children && node.children[part]) {
            node = node.children[part];
        } else {
            return null;
        }
    }
    return node;
}

function createFileInPath(path, fileName, content = '', type = 'file') {
    const node = getNodeAtPath(path);
    if (!node || node.type !== 'folder') return false;
    
    node.children[fileName] = {
        type: type,
        content: type === 'file' ? content : undefined,
        children: type === 'folder' ? {} : undefined,
        size: type === 'file' ? new Blob([content]).size : 0,
        modified: new Date().toISOString()
    };
    
    saveFileSystem();
    return true;
}

function deleteFileInPath(path, fileName) {
    const node = getNodeAtPath(path);
    if (!node || node.type !== 'folder') return false;
    
    delete node.children[fileName];
    saveFileSystem();
    return true;
}

function showContextMenu(e, context) {
    e.preventDefault();
    e.stopPropagation();
    const contextMenu = document.getElementById('context-menu');
    let menuItems = [];
    
    if (context.type === 'start-menu-app' || context.type === 'desktop-icon') {
        const appName = context.appName;
        const app = apps.find(a => a.name === appName);
        if (!app) return;
        
        menuItems = [
            { icon: 'fa-solid fa-play', text: 'Open', action: () => launchApp(appName) },
            { separator: true },
            { icon: app.pinned ? 'fa-solid fa-thumbtack' : 'fa-regular fa-thumbtack', text: app.pinned ? 'Unpin from Desktop' : 'Pin to Desktop', action: () => toggleDesktopPin(appName) },
            { icon: app.pinnedToTaskbar ? 'fa-solid fa-star' : 'fa-regular fa-star', text: app.pinnedToTaskbar ? 'Unpin from Taskbar' : 'Pin to Taskbar', action: () => toggleTaskbarPin(appName) }
        ];
        
        if (app.isCustom) {
            menuItems.push({ separator: true });
            menuItems.push({ icon: 'fa-solid fa-trash', text: 'Remove App', action: () => {
                if (confirm(`Are you sure you want to permanently remove "${appName}"?`)) {
                    apps = apps.filter(a => a.name !== appName);
                    saveApps();
                    renderDesktopIcons();
                    renderAppList();
                }
            }});
        }
    } else if (context.type === 'taskbar-app') {
        const appName = context.appName;
        const windowId = Object.keys(openWindows).find(id => openWindows[id].appName === appName);
        const app = apps.find(a => a.name === appName);
        if (!app) return;
        
        menuItems = [
            { icon: app.icon, text: app.name, header: true },
            { separator: true },
        ];
        
        if (windowId) {
            menuItems.push({ icon: 'fa-solid fa-times', text: 'Close', action: () => closeWindow(windowId) });
        } else {
             menuItems.push({ icon: 'fa-solid fa-play', text: 'Open', action: () => launchApp(appName) });
        }
        menuItems.push({ icon: 'fa-solid fa-star', text: 'Unpin from Taskbar', action: () => toggleTaskbarPin(appName) });
    } else if (context.type === 'desktop') {
        menuItems = [
            { icon: 'fa-solid fa-sync-alt', text: 'Refresh', action: renderDesktopIcons },
            { separator: true },
            { icon: 'fa-solid fa-folder-plus', text: 'New Folder', action: () => alert('New Folder coming soon!') },
            { icon: 'fa-solid fa-paint-brush', text: 'Personalize', action: () => launchApp('Settings') },
            { separator: true },
            { icon: 'fa-solid fa-info-circle', text: 'About luminalOS', action: () => launchApp('About') }
        ];
    }
    
    contextMenu.innerHTML = '';
    menuItems.forEach(item => {
        function renderIcon(icon) {
            if (!icon) return '';
            if (icon.endsWith('.png') || icon.endsWith('.jpg') || icon.endsWith('.svg')) {
                return `<img src="${icon}" alt="" style="width:16px; height:16px; display:inline-block; vertical-align:middle; margin-right:5px;">`;
            } else {
                return `<i class="${icon}" style="width:16px; display:inline-block; vertical-align:middle; margin-right:5px;"></i>`;
            }
        }
        
        if (item.separator) {
            contextMenu.appendChild(document.createElement('div')).className = 'context-menu-separator';
        } else if (item.header) {
            const header = document.createElement('div');
            header.className = 'context-menu-item header';
            header.innerHTML = `${renderIcon(item.icon)}<span>${item.text}</span>`;
            contextMenu.appendChild(header);
        } else {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.innerHTML = `${renderIcon(item.icon)}<span>${item.text}</span>`;
            menuItem.onclick = () => { item.action(); hideContextMenu(); };
            contextMenu.appendChild(menuItem);
        }
    });
    
    const rect = contextMenu.getBoundingClientRect();
    let x = e.clientX, y = e.clientY;
    if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width;
    if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height;
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.style.display = 'block';
}

function hideContextMenu() { document.getElementById('context-menu').style.display = 'none'; }

function toggleDesktopPin(appName) {
    const app = apps.find(a => a.name === appName);
    if (app) { app.pinned = !app.pinned; saveApps(); renderDesktopIcons(); }
}

function toggleTaskbarPin(appName) {
    const app = apps.find(a => a.name === appName);
    if (app) { app.pinnedToTaskbar = !app.pinnedToTaskbar; saveApps(); updateTaskbar(); }
}

function createWindow(options) {
    const windowId = 'window_' + Date.now();
    const windowEl = document.createElement('div'); 
    windowEl.className = 'window'; 
    windowEl.id = windowId;
    
    let width = options.width || 600, height = options.height || 400;
    let left = options.x === undefined ? (window.innerWidth - width) / 2 : options.x;
    let top = options.y === undefined ? (window.innerHeight - 40 - height) / 2 : options.y;
    
    const visibleWidth = window.innerWidth, visibleHeight = window.innerHeight - 40;
    if (left + width < 50 || top + height < 50 || left > visibleWidth - 50 || top > visibleHeight - 50) {
        width = Math.min(width, visibleWidth * 1); 
        height = Math.min(height, visibleHeight * 0.95);
        left = (visibleWidth - width) / 2; 
        top = (visibleHeight - height) / 2;
    }
    
    windowEl.style.width = width + 'px'; 
    windowEl.style.height = height + 'px'; 
    windowEl.style.left = left + 'px'; 
    windowEl.style.top = top + 'px'; 
    windowEl.style.zIndex = ++zIndex;
    
    const header = document.createElement('div'); 
    header.className = 'window-header';
    const title = document.createElement('div'); 
    title.className = 'window-title'; 
    title.textContent = options.title || 'Window';
    const controls = document.createElement('div'); 
    controls.className = 'window-controls';
    
    const closeBtn = document.createElement('button'); 
    closeBtn.className = 'window-control close'; 
    closeBtn.onclick = () => closeWindow(windowId);
    const minBtn = document.createElement('button'); 
    minBtn.className = 'window-control minimize'; 
    minBtn.onclick = () => minimizeWindow(windowId);
    const maxBtn = document.createElement('button'); 
    maxBtn.className = 'window-control maximize'; 
    maxBtn.onclick = () => toggleFullscreen(windowId);
    
    const addTouch = (el, action) => {
        el.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            action();
        }, { passive: false });
    };
    
    addTouch(closeBtn, () => closeWindow(windowId));
    addTouch(minBtn, () => minimizeWindow(windowId));
    addTouch(maxBtn, () => toggleFullscreen(windowId));
    
    controls.appendChild(maxBtn); 
    controls.appendChild(minBtn); 
    controls.appendChild(closeBtn);
    header.appendChild(title); 
    header.appendChild(controls);
    
    const content = document.createElement('div'); 
    content.className = 'window-content';
    
    let iframe = null;
    if (options.url) { 
        iframe = document.createElement('iframe');
        iframe.src = options.url; 
        iframe.setAttribute('sandbox', 'allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts');
        content.appendChild(iframe); 
    } else if (options.html) { 
        content.innerHTML = options.html; 
    }
    
    if (iframe) {
        const focusBtn = document.createElement('button');
        focusBtn.className = 'focus-iframe-btn';
        focusBtn.id = `focus-btn-${windowId}`;
        focusBtn.innerHTML = `<i class="fa-solid fa-keyboard"></i> Focus Keyboard`;
        focusBtn.onclick = function(e) {
            e.stopPropagation(); 
            try {
                iframe.focus();
            } catch (err) {
                console.warn("Could not focus iframe", err);
            }
            focusBtn.classList.add('hidden');
        };
        content.appendChild(focusBtn);
    }
    
    windowEl.appendChild(header); 
    windowEl.appendChild(content);
    
    makeDraggable(windowEl, header);
    makeResizable(windowEl);
    
    document.body.appendChild(windowEl);
    
    windowEl.addEventListener('mousedown', () => focusWindow(windowId), true);
    windowEl.addEventListener('touchstart', () => focusWindow(windowId), true);
    
    openWindows[windowId] = { 
        element: windowEl, 
        title: options.title || 'Window', 
        appName: options.appName, 
        minimized: false, 
        fullscreen: false, 
        preFullscreenState: {}, 
        focused: false, 
        iframeRef: iframe, 
        isSnapped: false, 
        preSnapState: {}
    };
    
    focusWindow(windowId); 
    updateTaskbar(); 
    return windowId;
}

function addMoveListeners(moveHandler, upHandler) {
    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
    window.addEventListener('touchmove', moveHandler, { passive: false });
    window.addEventListener('touchend', upHandler);
}

function removeMoveListeners(moveHandler, upHandler) {
    window.removeEventListener('mousemove', moveHandler);
    window.removeEventListener('mouseup', upHandler);
    window.removeEventListener('touchmove', moveHandler);
    window.removeEventListener('touchend', upHandler);
}

function getEventCoords(e) {
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

function makeDraggable(element, handle) {
    const snapThreshold = 20;
    const taskbarHeight = document.getElementById('taskbar').offsetHeight + 8;
    
    const startDrag = (e) => {
        if (e.target.classList.contains('window-control')) return;
        e.preventDefault();
        
        const coords = getEventCoords(e);
        let pos3 = coords.x;
        let pos4 = coords.y;
        
        element.classList.add('is-moving');
        
        const windowData = openWindows[element.id];
        if (windowData && (windowData.isSnapped || windowData.fullscreen)) {
            const preState = windowData.isSnapped ? windowData.preSnapState : windowData.preFullscreenState;
            const newWidth = parseInt(preState.width, 10) || 600;
            
            element.style.transition = 'none'; 
            element.style.width = newWidth + 'px';
            element.style.height = preState.height || '400px';
            element.style.left = (coords.x - (newWidth / 2)) + 'px';
            element.style.top = (coords.y - 15) + 'px'; 
            
            if (windowData.isSnapped) windowData.isSnapped = false;
            if (windowData.fullscreen) windowData.fullscreen = false;
            
            void element.offsetWidth;
            element.style.transition = '';
        }
        
        const doDrag = (e) => {
            e.preventDefault();
            const currentCoords = getEventCoords(e);
            let pos1 = pos3 - currentCoords.x;
            let pos2 = pos4 - currentCoords.y;
            pos3 = currentCoords.x;
            pos4 = currentCoords.y;
            
            let newTop = element.offsetTop - pos2;
            let newLeft = element.offsetLeft - pos1;
            
            const windowData = openWindows[element.id];
            windowData.isSnapped = false;
            
            if (currentCoords.y < snapThreshold) {
                element.style.top = '0px';
                element.style.left = '0px';
                element.style.width = '100vw';
                element.style.height = `calc(100vh - ${taskbarHeight}px)`;
                windowData.isSnapped = true;
                if (!windowData.preSnapState.width) windowData.preSnapState = { width: element.style.width, height: element.style.height, top: element.style.top, left: element.style.left };
            } else if (currentCoords.x < snapThreshold) {
                element.style.top = '0px';
                element.style.left = '0px';
                element.style.width = '50vw';
                element.style.height = `calc(100vh - ${taskbarHeight}px)`;
                windowData.isSnapped = true;
                if (!windowData.preSnapState.width) windowData.preSnapState = { width: element.style.width, height: element.style.height, top: element.style.top, left: element.style.left };
            } else if (currentCoords.x > window.innerWidth - snapThreshold) {
                element.style.top = '0px';
                element.style.left = '50vw';
                element.style.width = '50vw';
                element.style.height = `calc(100vh - ${taskbarHeight}px)`;
                windowData.isSnapped = true;
                if (!windowData.preSnapState.width) windowData.preSnapState = { width: element.style.width, height: element.style.height, top: element.style.top, left: element.style.left };
            } else {
                windowData.preSnapState = {}; 
                element.style.top = newTop + "px";
                element.style.left = newLeft + "px";
            }
        };
        
        const stopDrag = () => {
            element.classList.remove('is-moving');
            removeMoveListeners(doDrag, stopDrag);
        };
        
        addMoveListeners(doDrag, stopDrag);
    };
    
    handle.addEventListener('mousedown', startDrag);
    handle.addEventListener('touchstart', startDrag, { passive: false });
}

function closeWindow(windowId) { 
    const windowData = openWindows[windowId]; 
    if (windowData) {
        if (windowData.onClose) {
            windowData.onClose();
        }
        windowData.element.remove(); 
        delete openWindows[windowId]; 
        updateTaskbar(); 
    } 
}

function minimizeWindow(windowId) { 
    const windowData = openWindows[windowId]; 
    if (windowData) { 
        windowData.element.style.display = 'none'; 
        windowData.minimized = true; 
        updateTaskbar(); 
    } 
}

function restoreWindow(windowId) { 
    const windowData = openWindows[windowId]; 
    if (windowData) { 
        windowData.element.style.display = 'flex'; 
        windowData.minimized = false; 
        focusWindow(windowId); 
    } 
}

function openAbout(options) { 
    options.html = `<div style="padding: 30px; text-align: center; color: var(--text-color);">
        <i class="fa-solid fa-rocket fa-3x"></i>
        <h2>luminalOS</h2><br><br>
        Luminal is a OS-based pr0xy/gÃme site for school. join our discord at https://discord.luminal.lol<br>
        made by sealiee1 with help from dylanisnothere, and credits to NPA for some game ports, and selenite+3kh0 for some games(i do not endorese piracy). 
        if you have any questions, comments, concerns or requests, please contact us on discord. 
        For a formal request, such as a DMCA, or if you do not want to use discord for something important, reach out to contact@luminal.cc
    </div>`; 
    options.width=800; 
    options.height=500; 
    createWindow(options); 
}

function openJSExecutor(options) {
    options.width = 700;
    options.height = 500;
    options.html = `
        <div style="height: 100%; display: flex; flex-direction: column; background: #1e1e1e; color: #d4d4d4; font-family: 'Fira Code', monospace;">
            <div style="height: 60%; border-bottom: 1px solid #3e3e42;">
                <div style="background: #252526; padding: 10px; border-bottom: 1px solid #3e3e42; display: flex; align-items: center; gap: 10px;">
                    <span style="color: #4a90e2; font-weight: bold;">JavaScript Executor</span>
                    <button class="os-button" onclick="runJavaScript()"><i class="fa-solid fa-play"></i> Run (Ctrl+Enter)</button>
                    <button class="os-button" onclick="clearJSEditor()"><i class="fa-solid fa-trash"></i> Clear</button>
                    <button class="os-button" onclick="loadJSExample()"><i class="fa-solid fa-lightbulb"></i> Example</button>
                </div>
                <textarea id="js-editor" style="width: 100%; height: calc(100% - 50px); background: #1e1e1e; color: #d4d4d4; border: none; padding: 15px; font-family: 'Fira Code', monospace; font-size: 14px; resize: none; line-height: 1.5;" placeholder="// Full JavaScript execution environment
// Try async/await, classes, modules, DOM manipulation, etc.
console.log('Welcome to the JS Executor!');
// Examples you can try:
// fetch('https://api.github.com/users/octocat').then(r => r.json()).then(console.log);
// new Promise(resolve => setTimeout(() => resolve('Hello after 1s'), 1000)).then(console.log);
// class MyClass { constructor(name) { this.name = name; } }"></textarea>
            </div>
            <div style="height: 40%; background: #0c0c0c; display: flex; flex-direction: column;">
                <div style="background: #252526; padding: 10px; border-bottom: 1px solid #3e3e42; display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #4a90e2;">Console Output</span>
                    <button class="os-button" onclick="clearJSOutput()" style="padding: 5px 10px; font-size: 12px;"><i class="fa-solid fa-eraser"></i></button>
                </div>
                <div id="js-output" style="flex: 1; padding: 15px; font-size: 13px; overflow-y: auto; white-space: pre-wrap; font-family: 'Fira Code', monospace;"></div>
            </div>
        </div>`;
    
    createWindow(options);
    
    setTimeout(() => {
        const editor = document.getElementById('js-editor');
        editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                runJavaScript();
            }
        });
    }, 100);
}

window.runJavaScript = () => {
    const code = document.getElementById('js-editor').value;
    const output = document.getElementById('js-output');
    const logs = [];
    
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info,
        debug: console.debug,
        table: console.table,
        group: console.group,
        groupEnd: console.groupEnd,
        time: console.time,
        timeEnd: console.timeEnd
    };
    
    const formatValue = (value) => {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') return `"${value}"`;
        if (typeof value === 'function') return value.toString();
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value, null, 2);
            } catch {
                return '[Circular Reference]';
            }
        }
        return String(value);
    };
    
    console.log = (...args) => {
        logs.push('📝 ' + args.map(formatValue).join(' '));
        originalConsole.log(...args);
    };
    console.error = (...args) => {
        logs.push('❌ ' + args.map(formatValue).join(' '));
        originalConsole.error(...args);
    };
    console.warn = (...args) => {
        logs.push('⚠️ ' + args.map(formatValue).join(' '));
        originalConsole.warn(...args);
    };
    console.info = (...args) => {
        logs.push('ℹ️ ' + args.map(formatValue).join(' '));
        originalConsole.info(...args);
    };
    console.table = (data) => {
        logs.push('📊 Table:');
        logs.push(formatValue(data));
        originalConsole.table(data);
    };
    
    try {
        const asyncCode = `
            (async () => {
                ${code}
            })().catch(err => {
                console.error('Async Error:', err.message);
                throw err;
            });
        `;
        const result = eval(asyncCode);
        
        if (result instanceof Promise) {
            result.then(promiseResult => {
                if (promiseResult !== undefined) {
                    logs.push('✅ Promise resolved: ' + formatValue(promiseResult));
                    updateJSOutput();
                }
            }).catch(err => {
                logs.push('❌ Promise rejected: ' + err.message);
                updateJSOutput();
            });
        }
        
        const immediateResult = eval(code);
        if (immediateResult !== undefined && !(immediateResult instanceof Promise)) {
            logs.push('↩️ ' + formatValue(immediateResult));
        }
    } catch (error) {
        logs.push('❌ Error: ' + error.message);
        logs.push('   at line: ' + (error.lineNumber || 'unknown'));
    }
    
    Object.assign(console, originalConsole);
    
    function updateJSOutput() {
        output.textContent = logs.join('\n') || 'No output';
        output.scrollTop = output.scrollHeight;
    }
    
    updateJSOutput();
};

window.clearJSEditor = () => {
    document.getElementById('js-editor').value = '';
    document.getElementById('js-output').textContent = '';
};

window.clearJSOutput = () => {
    document.getElementById('js-output').textContent = '';
};

function openAppCreator(options) { 
    options.html = `<div style="padding: 20px; color: #fff;">
        <h3>App Creator</h3>
        <p>Add a custom app to your desktop.</p>
        <input id="custom-app-name" class="settings-input" placeholder="App Name">
        <input id="custom-app-url" class="settings-input" placeholder="Website URL">
        <button class="os-button" onclick="addCustomApp()">Create App</button>
    </div>`; 
    options.width=400; 
    options.height=350; 
    createWindow(options); 
}

window.addCustomApp = () => { 
    const name=document.getElementById('custom-app-name').value, url=document.getElementById('custom-app-url').value; 
    if (!name||!url) return; 
    const newApp={name,icon:"fa-solid fa-globe",type:'proxied_url',content:url,pinned:true,pinnedToTaskbar:false,isCustom:true}; 
    apps.push(newApp); 
    saveApps(); 
    renderDesktopIcons(); 
    renderAppList(); 
}

function openPartnerProxied(url, name) {
    const pr0xyUrl = (rawUrl) => `embed.html#${rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl}`;
    createWindow({
        title: name,
        appName: name,
        url: pr0xyUrl(url),
        width: 1024,
        height: 768
    });
}

function openNotes(options) { 
    const savedNotes = localStorage.getItem('luminal_notes') || ''; 
    options.html = `<textarea style="width: 100%; height: 100%; border: none; background: #333; color: white; padding: 10px; box-sizing: border-box; resize: none;" onchange="localStorage.setItem('luminal_notes', this.value)">${savedNotes}</textarea>`; 
    options.width = 400; 
    options.height = 500; 
    createWindow(options); 
}

function focusWindow(windowId) {
    Object.entries(openWindows).forEach(([id, win]) => {
        if (win && win.element) {
            if (id === windowId) {
                win.focused = true;
                win.element.style.zIndex = ++zIndex;
                if (win.iframeRef) {
                    try { win.iframeRef.focus(); } catch (e) {}
                    const focusBtn = document.getElementById(`focus-btn-${id}`);
                    if (focusBtn) focusBtn.classList.add('hidden');
                }
            } else {
                win.focused = false;
                if (win.iframeRef) {
                    const focusBtn = document.getElementById(`focus-btn-${id}`);
                    if (focusBtn) {
                        focusBtn.classList.remove('hidden');
                    }
                }
            }
        }
    });
    updateTaskbar();
}

function makeResizable(element) {
    const handles = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];
    handles.forEach(handleName => {
        const handle = document.createElement('div');
        handle.className = `resizer ${handleName}`;
        element.appendChild(handle);
        
        const initResize = (e) => {
            e.stopPropagation();
            e.preventDefault();
            element.classList.add('is-moving');
            
            const startCoords = getEventCoords(e);
            const startX = startCoords.x;
            const startY = startCoords.y;
            const startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
            const startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
            const startLeft = element.offsetLeft;
            const startTop = element.offsetTop;
            
            const doResize = (e) => {
                const currentCoords = getEventCoords(e);
                
                if (handleName.includes('e')) {
                    const newWidth = startWidth + currentCoords.x - startX;
                    if (newWidth > 0) element.style.width = `${newWidth}px`;
                }
                if (handleName.includes('s')) {
                    const newHeight = startHeight + currentCoords.y - startY;
                    if (newHeight > 0) element.style.height = `${newHeight}px`;
                }
                if (handleName.includes('w')) {
                    const newWidth = startWidth - (currentCoords.x - startX);
                    if (newWidth > 0) {
                        element.style.width = `${newWidth}px`;
                        element.style.left = `${startLeft + (startWidth - newWidth)}px`;
                    }
                }
                if (handleName.includes('n')) {
                    const newHeight = startHeight - (currentCoords.y - startY);
                    if (newHeight > 0) {
                        element.style.height = `${newHeight}px`;
                        element.style.top = `${startTop + (startHeight - newHeight)}px`;
                    }
                }
            };
            
            const stopResize = () => {
                element.classList.remove('is-moving');
                removeMoveListeners(doResize, stopResize);
            };
            
            addMoveListeners(doResize, stopResize);
        };
        
        handle.addEventListener('mousedown', initResize);
        handle.addEventListener('touchstart', initResize, { passive: false });
    });
}

function cloakPage() {
    document.title = "Home";
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = "https://ssl.gstatic.com/classroom/favicon.png";
}

function uncloakPage() {
    document.title = originalTitle;
    document.querySelector("link[rel~='icon']").href = originalFavicon;
}

function toggleFullscreen(windowId) {
    const windowData = openWindows[windowId];
    if (!windowData || !windowData.element) return;
    
    const winEl = windowData.element;
    if (windowData.fullscreen) {
        winEl.style.width = windowData.preFullscreenState.width;
        winEl.style.height = windowData.preFullscreenState.height;
        winEl.style.top = windowData.preFullscreenState.top;
        winEl.style.left = windowData.preFullscreenState.left;
        windowData.fullscreen = false;
    } else {
        windowData.preFullscreenState = {
            width: winEl.style.width,
            height: winEl.style.height,
            top: winEl.style.top,
            left: winEl.style.left
        };
        winEl.style.top = '0px';
        winEl.style.left = '0px';
        winEl.style.width = '100vw';
        winEl.style.height = '100vh'; 
        windowData.fullscreen = true;
    }
}


function openCollabSpace(options) {
    options.appName = 'Collab Space';
    const uniqueId = 'collab_' + Date.now();
    options.html = `<style>
        .collab-container { color: var(--text-color); background: var(--window-bg); height: 100%; display: flex; }
        .collab-sidebar { background: rgba(0,0,0,0.1); width: 300px; border-left: 1px solid var(--window-border); display: flex; flex-direction: column; }
        .collab-user-list-item { cursor: pointer; padding: 8px 12px; border-radius: 4px; margin-bottom: 3px; transition: background 0.2s; position: relative; display: flex; justify-content: space-between; align-items: center; }
        .collab-user-list-item:hover, .collab-user-list-item.active { background-color: var(--accent-color); color: white; }
        .collab-unread-badge { background-color: #ff5f57; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .collab-chat-message { margin-bottom: 8px; padding: 4px 8px; border-radius: 4px; }
        .collab-chat-message strong { color: var(--accent-color); }
        .collab-chat-message.dm { background: rgba(255,255,255,0.05); border-left: 2px solid var(--accent-color); }
        .collab-chat-message.system { font-style: italic; color: #aaa; }
        #${uniqueId}-chat-area { min-height: 0; position: relative; overflow: hidden; }
        #${uniqueId}-chat-messages { flex: 1 1 auto; overflow-y: auto; }
        #${uniqueId}-user-list-container { flex-shrink: 0; }
        .join-options { display: flex; gap: 10px; margin-top: 15px; }
        .collab-dm-toast { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); padding: 8px 15px; border-radius: 20px; font-size: 13px; z-index: 10; animation: fadeInOut 4s ease-out forwards; }
        @keyframes fadeInOut { 0% { opacity: 0; bottom: 0px; } 10% { opacity: 1; bottom: 10px; } 90% { opacity: 1; bottom: 10px; } 100% { opacity: 0; bottom: 0px; } }
        .connection-status { position: absolute; top: 8px; right: 8px; padding: 4px 8px; border-radius: 4px; font-size: 11px; background: rgba(0,0,0,0.5); }
        .connection-status.connected { color: #4ade80; }
        .connection-status.connecting { color: #fbbf24; }
        .connection-status.disconnected { color: #f87171; }
    </style>
    <div id="${uniqueId}-modal" style="position:absolute; inset:0; background:rgba(0,0,0,0.8); z-index:100; display:flex; align-items:center; justify-content:center; flex-direction:column; padding:20px; text-align:center;">
        <h3 style="color:white; margin-bottom: 10px;">Join Collab Space</h3>
        <p style="color:#ccc; font-size:14px; max-width:400px; margin-bottom:15px;">Choose a session to join. Your name will be visible to others.</p>
        <input id="${uniqueId}-username" class="settings-input" style="width:250px; text-align:center; font-size:18px; margin-bottom: 10px;" placeholder="Enter your name...">
        <div class="join-options">
            <button id="${uniqueId}-join-local-btn" class="os-button" style="padding: 10px 20px;">Join School/Network</button>
            <button id="${uniqueId}-join-global-btn" class="os-button" style="padding: 10px 20px; background-color: #6c5ce7;">Join Global Chat</button>
        </div>
        <p id="${uniqueId}-status" style="color:#aaa; font-size:12px; margin-top:15px;">Status: Idle</p>
    </div>
    <div id="${uniqueId}-main" class="collab-container" style="display:none;">
        <div style="flex:1; display:flex; flex-direction:column;">
            <div id="${uniqueId}-drawing-area" style="flex:1; position:relative; border-bottom:1px solid var(--window-border);">
                <canvas id="${uniqueId}-canvas" style="position:absolute; top:0; left:0; cursor: crosshair;"></canvas>
                <div id="${uniqueId}-draw-toolbar" style="position:absolute; top:8px; left:8px; background:var(--window-bg); padding:8px; border-radius:8px; border: 1px solid var(--window-border); display:flex; gap:8px; align-items:center;">
                    <input type="color" id="${uniqueId}-color-picker" value="#FFFFFF" title="Brush Color" style="width: 40px; height: 40px; border: none; cursor: pointer;">
                    <button id="${uniqueId}-clear-canvas" class="os-button" title="Clear Canvas for Everyone"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div id="${uniqueId}-connection-status" class="connection-status connecting">Connecting...</div>
            </div>
            <textarea id="${uniqueId}-notepad" placeholder="Shared notepad... start typing!" style="flex:1; background:transparent; color:var(--text-color); border:none; padding:10px; font-family: 'Fira Code'; resize:none;"></textarea>
        </div>
        <div class="collab-sidebar">
            <div id="${uniqueId}-user-list-container">
                <h4 style="padding:10px; margin:0; border-bottom:1px solid var(--window-border);">Online (<span id="${uniqueId}-user-count">1</span>)</h4>
                <ul id="${uniqueId}-user-list" style="list-style:none; margin:0; padding:10px; height: 150px; overflow-y:auto;">
                    <li id="${uniqueId}-group-chat-btn" class="collab-user-list-item active"># Group Chat</li>
                </ul>
            </div>
            <div id="${uniqueId}-chat-area" style="flex:1; display:flex; flex-direction:column; border-top:1px solid var(--window-border);">
                <div id="${uniqueId}-chat-header" style="padding:10px; background:var(--header-bg);">Chatting in: <strong id="${uniqueId}-chat-target"># Group Chat</strong></div>
                <div id="${uniqueId}-chat-messages" style="flex:1; padding:10px; overflow-y:auto; word-break:break-word;"></div>
                <div style="display:flex; padding:5px; border-top:1px solid var(--window-border);">
                    <input id="${uniqueId}-chat-input" placeholder="Type a message..." style="flex:1; background:transparent; color:var(--text-color); border:none; padding: 5px;">
                    <button id="${uniqueId}-chat-send" class="os-button" style="padding:5px 10px;">Send</button>
                </div>
            </div>
        </div>
    </div>`;
    
    const windowId = createWindow(options);
    setTimeout(() => initializeCollabSpace(windowId, uniqueId), 100);
}

async function initializeCollabSpace(windowId, uniqueId) {
    let peer, myPeerId, username, currentChatId = 'group';
    let connections = {};
    const users = {};
    let roomType = 'local';
    let ws;
    let unreadMessages = {};

    const modal = document.getElementById(`${uniqueId}-modal`);
    const mainArea = document.getElementById(`${uniqueId}-main`);
    const usernameInput = document.getElementById(`${uniqueId}-username`);
    const joinLocalBtn = document.getElementById(`${uniqueId}-join-local-btn`);
    const joinGlobalBtn = document.getElementById(`${uniqueId}-join-global-btn`);
    const statusText = document.getElementById(`${uniqueId}-status`);
    const canvas = document.getElementById(`${uniqueId}-canvas`);
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById(`${uniqueId}-color-picker`);
    const clearCanvasBtn = document.getElementById(`${uniqueId}-clear-canvas`);
    const notepad = document.getElementById(`${uniqueId}-notepad`);
    const userListUI = document.getElementById(`${uniqueId}-user-list`);
    const userCountUI = document.getElementById(`${uniqueId}-user-count`);
    const chatArea = document.getElementById(`${uniqueId}-chat-area`);
    const chatHeader = document.getElementById(`${uniqueId}-chat-target`);
    const chatMessages = document.getElementById(`${uniqueId}-chat-messages`);
    const chatInput = document.getElementById(`${uniqueId}-chat-input`);
    const sendBtn = document.getElementById(`${uniqueId}-chat-send`);
    const connectionStatus = document.getElementById(`${uniqueId}-connection-status`);

    const badWords = ['kys', 'nigger', 'nigga', 'faggot', 'retard', 'kill yourself'];
    const filterMessage = (message) => {
        let cleanMessage = message;
        const lowerCaseMessage = message.toLowerCase();
        for (const word of badWords) {
            if (lowerCaseMessage.includes(word)) {
                const regex = new RegExp(word, 'gi');
                cleanMessage = cleanMessage.replace(regex, '****');
            }
        }
        return cleanMessage;
    };

    let isDrawing = false;
    let lastX = 0, lastY = 0;
    let isUpdatingNotepad = false;

    const updateConnectionStatus = (status) => {
        connectionStatus.className = `connection-status ${status}`;
        connectionStatus.textContent = status === 'connected' ? '● Connected' : 
                                       status === 'connecting' ? '● Connecting...' : 
                                       '● Disconnected';
    };

    const setupWebSocket = (selectedRoomType) => {
        return new Promise((resolve, reject) => {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/api/collab/ws?roomType=${selectedRoomType}`;
            
            console.log('Connecting to WebSocket:', wsUrl);
            ws = new WebSocket(wsUrl);
            
            ws.onopen = () => {
                console.log('WebSocket connected!');
                updateConnectionStatus('connected');
                resolve();
            };
            
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('WebSocket message received:', data);
                    
                    if (data.type === 'newUser') {
                        if (data.peerId !== myPeerId && !connections[data.peerId]) {
                            console.log('NEW USER DETECTED:', data.username, data.peerId);
                            addSystemMessage(`${data.username} is joining...`);
                            setTimeout(() => tryConnect(data.peerId), 500);
                        }
                    } else if (data.type === 'roomState') {
                        console.log('Room state received:', data.users);
                        data.users.forEach(user => {
                            if (user.peerId !== myPeerId && !connections[user.peerId] && !users[user.peerId]) {
                                console.log('Connecting to existing user from roomState:', user.username, user.peerId);
                                setTimeout(() => tryConnect(user.peerId), 500);
                            }
                        });
                    } else if (data.type === 'connected') {
                        console.log('WebSocket connection confirmed');
                    }
                } catch (err) {
                    console.error('WebSocket message parse error:', err);
                }
            };
            
            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                updateConnectionStatus('disconnected');
                reject(error);
            };
            
            ws.onclose = () => {
                console.log('WebSocket closed');
                updateConnectionStatus('disconnected');
            };
            
            setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
        });
    };

    const joinSession = async (selectedRoomType) => {
        username = usernameInput.value.trim();
        if (!username) { alert('Please enter a username.'); return; }
        roomType = selectedRoomType;
        statusText.textContent = `Connecting to ${roomType} network...`;
        
        try {
            updateConnectionStatus('connecting');
            await setupWebSocket(roomType);
            console.log('WebSocket ready!');
            
            peer = new Peer();
            
            await new Promise((resolve, reject) => {
                peer.on('open', (id) => {
                    myPeerId = id;
                    users[myPeerId] = username;
                    console.log('PeerJS ready with ID:', myPeerId);
                    resolve();
                });
                
                peer.on('error', (err) => {
                    console.error('PeerJS error:', err);
                    reject(err);
                });
                
                setTimeout(() => reject(new Error('PeerJS timeout')), 5000);
            });
            
            peer.on('connection', conn => setupConnection(conn));
            
            const response = await fetch('/api/collab/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ peerId: myPeerId, username, roomType })
            });
            
            const { peers } = await response.json();
            console.log('Joined room! Existing peers:', peers);
            
            modal.style.display = 'none';
            mainArea.style.display = 'flex';
            addSystemMessage(`You have joined the ${roomType} session.`);
            setupApp();
            
            peers.forEach(p => {
                if (p.peerId !== myPeerId) {
                    console.log('Connecting to existing peer:', p.username, p.peerId);
                    tryConnect(p.peerId);
                }
            });
            
            if (peers.length === 0) {
                addSystemMessage('You are the first user in this room. Waiting for others...');
            }
            
        } catch (error) {
            console.error('Join error:', error);
            statusText.textContent = `Error: ${error.message}`;
            updateConnectionStatus('disconnected');
        }

        const windowEl = document.getElementById(windowId);
        if (windowEl) {
            const closeBtn = windowEl.querySelector('.window-control.close');
            const originalOnclick = closeBtn.onclick;
            closeBtn.onclick = () => {
                if (ws) ws.close();
                originalOnclick();
            };
        }
    };

    joinLocalBtn.addEventListener('click', () => joinSession('local'));
    joinGlobalBtn.addEventListener('click', () => joinSession('global'));

    function tryConnect(peerId) {
        if (connections[peerId] || peerId === myPeerId) {
            console.log('Skipping connection - already connected or self:', peerId);
            return;
        }
        
        console.log('Attempting to connect to peer:', peerId);
        const conn = peer.connect(peerId, { reliable: true });
        
        const timeout = setTimeout(() => {
            if (!connections[peerId]) {
                console.log('Connection timeout, retrying:', peerId);
                tryConnect(peerId);
            }
        }, 5000);
        
        conn.on('open', () => {
            clearTimeout(timeout);
            console.log('Connection opened, clearing timeout for:', peerId);
        });
        
        setupConnection(conn);
    }

    function showNewDmNotification(senderName) {
        const toast = document.createElement('div');
        toast.className = 'collab-dm-toast';
        toast.innerHTML = `<i class="fa-solid fa-envelope"></i> New message from <strong>${senderName}</strong>`;
        chatArea.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    function setupApp() {
        const canvasContainer = document.getElementById(`${uniqueId}-drawing-area`);
        
        function resizeCanvas() {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            canvas.width = canvasContainer.clientWidth;
            canvas.height = canvasContainer.clientHeight;
            ctx.putImageData(imageData, 0, 0);
        }
        resizeCanvas();
        
        new ResizeObserver(resizeCanvas).observe(canvasContainer);
        
        clearCanvasBtn.addEventListener('click', () => { ctx.clearRect(0, 0, canvas.width, canvas.height); broadcast({ type: 'clear-canvas' }); });
        canvas.addEventListener('mousedown', (e) => { isDrawing = true; [lastX, lastY] = [e.offsetX, e.offsetY]; });
        canvas.addEventListener('mousemove', (e) => { if (isDrawing) { drawLine(lastX, lastY, e.offsetX, e.offsetY, colorPicker.value, true); [lastX, lastY] = [e.offsetX, e.offsetY]; } });
        canvas.addEventListener('mouseup', () => isDrawing = false);
        canvas.addEventListener('mouseout', () => isDrawing = false);
        notepad.addEventListener('input', () => { if (!isUpdatingNotepad) { broadcast({ type: 'notepad-update', content: notepad.value }); } });
        
        const sendMessage = () => {
            let message = chatInput.value.trim();
            if (message) {
                if (roomType === 'global') message = filterMessage(message);
                const messageData = { type: 'chat', target: currentChatId, content: message, sender: username };
                if (currentChatId === 'group') {
                    broadcast(messageData);
                    addChatMessage(messageData.sender, message, 'group');
                } else {
                    if (connections[currentChatId]) {
                        connections[currentChatId].send(messageData);
                        addChatMessage(username, message, currentChatId, true);
                    }
                }
                chatInput.value = '';
            }
        };
        
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
        
        updateUserListUI();
    }

    function drawLine(x1, y1, x2, y2, color, fromLocal = false) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
        if (fromLocal) broadcast({ type: 'draw', x1, y1, x2, y2, color });
    }

    function setupConnection(conn) {
        conn.on('open', () => {
            console.log('P2P connection opened with:', conn.peer);
            connections[conn.peer] = conn;
            conn.send({ type: 'handshake', username, users, notepad: notepad.value, canvas: canvas.toDataURL(), peerId: myPeerId });
        });
        
        conn.on('data', data => handleIncomingData(conn, data));
        
        conn.on('close', () => {
            const disconnectedUser = users[conn.peer] || 'A user';
            addSystemMessage(`${disconnectedUser} has disconnected.`);
            delete connections[conn.peer];
            delete users[conn.peer];
            updateUserListUI();
        });
    }

    function handleIncomingData(conn, data) {
        switch (data.type) {
            case 'handshake':
                if (!users[conn.peer]) {
                    addSystemMessage(`${data.username} has connected.`);
                    const img = new Image();
                    img.onload = () => ctx.drawImage(img, 0, 0);
                    img.src = data.canvas;
                    isUpdatingNotepad = true;
                    notepad.value = data.notepad;
                    isUpdatingNotepad = false;
                }
                users[conn.peer] = data.username;
                Object.keys(data.users).forEach(peerId => { if (!users[peerId] && peerId !== myPeerId) { users[peerId] = data.users[peerId]; } });
                broadcast({type: 'user-joined', peerId: conn.peer, username: data.username });
                updateUserListUI();
                break;
            case 'user-joined':
                if (!users[data.peerId]) { users[data.peerId] = data.username; updateUserListUI(); }
                break;
            case 'draw': drawLine(data.x1, data.y1, data.x2, data.y2, data.color); break;
            case 'clear-canvas': ctx.clearRect(0, 0, canvas.width, canvas.height); break;
            case 'notepad-update':
                isUpdatingNotepad = true;
                if (notepad.value !== data.content) { notepad.value = data.content; }
                isUpdatingNotepad = false;
                break;
            case 'chat':
                if (data.target === myPeerId) { 
                    addChatMessage(data.sender, data.content, conn.peer, true);
                    if (currentChatId !== conn.peer) {
                        unreadMessages[conn.peer] = (unreadMessages[conn.peer] || 0) + 1;
                        showNewDmNotification(data.sender);
                        updateUserListUI();
                    }
                } else if (data.target === 'group') {
                    addChatMessage(data.sender, data.content, 'group');
                }
                break;
        }
    }

    function updateUserListUI() {
        userCountUI.textContent = Object.keys(users).length;
        userListUI.innerHTML = `<li id="${uniqueId}-group-chat-btn" class="collab-user-list-item"><span># Group Chat</span></li>`;
        
        for (const peerId in users) {
            const name = users[peerId];
            if (peerId === myPeerId) {
                const meLi = document.createElement('li');
                meLi.style.cssText = "padding: 5px 12px; color: #aaa; font-style: italic;";
                meLi.textContent = `${name} (You)`;
                userListUI.appendChild(meLi);
            } else {
                const li = document.createElement('li');
                li.className = 'collab-user-list-item';
                li.dataset.peerId = peerId;
                let badge = '';
                if (unreadMessages[peerId]) {
                    badge = `<span class="collab-unread-badge">${unreadMessages[peerId]}</span>`;
                }
                li.innerHTML = `<span>${name}</span>${badge}`;
                li.addEventListener('click', () => switchChat(peerId, name));
                userListUI.appendChild(li);
            }
        }
        
        document.getElementById(`${uniqueId}-group-chat-btn`).addEventListener('click', () => switchChat('group'));
        const activeEl = document.querySelector(`.collab-user-list-item[data-peer-id="${currentChatId}"]`) || document.getElementById(`${uniqueId}-group-chat-btn`);
        if (activeEl) activeEl.classList.add('active');
    }

    function addChatMessage(sender, message, chatId, isDM = false) {
        if (isDM && chatId !== currentChatId && sender !== username) return;
        if (chatId === 'group' && currentChatId !== 'group' && !isDM) return;
        
        const div = document.createElement('div');
        div.className = 'collab-chat-message';
        if (isDM) div.classList.add('dm');
        div.innerHTML = `<strong>${sender}</strong>: ${message}`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addSystemMessage(message) {
        const div = document.createElement('div');
        div.className = 'collab-chat-message system';
        div.textContent = message;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function switchChat(peerId, name) {
        currentChatId = peerId;

        if (unreadMessages[peerId]) {
            delete unreadMessages[peerId];
        }

        const roomName = roomType === 'global' ? 'Global Chat' : 'Group Chat';
        chatHeader.textContent = name || (peerId === 'group' ? `# ${roomName}` : users[peerId]);
        updateUserListUI();
    }

    function broadcast(data) {
        Object.values(connections).forEach(conn => conn.send(data));
    }
}
function openFileExplorer(options) {
    options.width = 900;
    options.height = 600;
    options.title = "File Explorer";
    
    const explorerId = 'explorer-' + Date.now();
    options.html = `
        <style>
            .file-explorer-container { display: flex; height: 100%; background: var(--window-bg); }
            .file-sidebar { width: 200px; background: rgba(0,0,0,0.2); border-right: 1px solid var(--window-border); overflow-y: auto; }
            .file-tree-item { padding: 6px 10px; cursor: pointer; font-size: 13px; transition: background 0.2s; }
            .file-tree-item:hover { background: rgba(255,255,255,0.1); }
            .file-main { flex: 1; display: flex; flex-direction: column; }
            .file-toolbar { display: flex; align-items: center; padding: 8px 12px; background: var(--header-bg); border-bottom: 1px solid var(--window-border); gap: 8px; }
            .file-content { flex: 1; padding: 15px; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 15px; align-content: start; }
            .file-item { text-align: center; padding: 10px; cursor: pointer; border-radius: 8px; transition: background 0.2s; }
            .file-item:hover { background: rgba(255,255,255,0.1); }
            .file-item i { font-size: 48px; margin-bottom: 8px; display: block; }
            .file-item img { width: 48px; height: 48px; object-fit: cover; margin: 0 auto 8px; display: block; border-radius: 4px; }
            .file-item span { font-size: 12px; word-break: break-word; }
        </style>
        <div class="file-explorer-container">
            <div class="file-sidebar">
                <div style="padding: 15px; border-bottom: 1px solid var(--window-border);">
                    <h4 style="margin: 0; font-size: 14px;">📁 File System</h4>
                </div>
                <div id="file-tree-${explorerId}" style="padding: 10px;"></div>
            </div>
            <div class="file-main">
                <div class="file-toolbar">
                    <button class="os-button" onclick="fileExplorerGoUp('${explorerId}')"><i class="fa-solid fa-arrow-up"></i> Up</button>
                    <span id="current-path-${explorerId}" style="flex: 1; padding: 6px 12px; background: rgba(0,0,0,0.2); border-radius: 4px; font-family: monospace; font-size: 12px;">/</span>
                    <button class="os-button" onclick="fileExplorerRefresh('${explorerId}')"><i class="fa-solid fa-refresh"></i></button>
                    <button class="os-button" onclick="fileExplorerNewFolder('${explorerId}')"><i class="fa-solid fa-folder-plus"></i> New Folder</button>
                    <button class="os-button" onclick="fileExplorerNewFile('${explorerId}')"><i class="fa-solid fa-file-plus"></i> New File</button>
                    <button class="os-button" onclick="fileExplorerUpload('${explorerId}')"><i class="fa-solid fa-upload"></i> Upload</button>
                    <input type="file" id="file-upload-input-${explorerId}" style="display: none;" multiple>
                </div>
                <div class="file-content" id="file-content-${explorerId}"></div>
            </div>
        </div>
    `;
    
    createWindow(options);
    
    setTimeout(() => {
        window.fileExplorers = window.fileExplorers || {};
        window.fileExplorers[explorerId] = { currentPath: '/' };
        updateFileTree(explorerId);
        navigateToFilePath(explorerId, '/');
    }, 100);
}

function updateFileTree(explorerId) {
    const tree = document.getElementById(`file-tree-${explorerId}`);
    if (!tree) return;
    tree.innerHTML = '';
    renderFileTreeRecursive(fileSystem['/'], '/', tree, 0, explorerId);
}

function renderFileTreeRecursive(node, path, container, level, explorerId) {
    if (node.type === 'folder' && node.children) {
        Object.keys(node.children).sort().forEach(name => {
            const fullPath = (path === '/' ? '' : path) + '/' + name;
            const item = document.createElement('div');
            item.className = 'file-tree-item';
            item.style.paddingLeft = (10 + level * 15) + 'px';
            item.innerHTML = `<i class="fa-solid fa-${node.children[name].type === 'folder' ? 'folder' : 'file'}"></i> ${name}`;
            item.addEventListener('click', () => navigateToFilePath(explorerId, fullPath));
            container.appendChild(item);
            
            if (node.children[name].type === 'folder') {
                renderFileTreeRecursive(node.children[name], fullPath, container, level + 1, explorerId);
            }
        });
    }
}

function navigateToFilePath(explorerId, path) {
    window.fileExplorers[explorerId].currentPath = path;
    const pathEl = document.getElementById(`current-path-${explorerId}`);
    if (pathEl) pathEl.textContent = path;
    
    const content = document.getElementById(`file-content-${explorerId}`);
    if (!content) return;
    content.innerHTML = '';
    
    const node = getNodeAtPath(path);
    if (node && node.type === 'folder' && node.children) {
        Object.keys(node.children).sort().forEach(name => {
            const child = node.children[name];
            const item = document.createElement('div');
            item.className = 'file-item';
            
            if (child.type === 'folder') {
                item.innerHTML = `<i class="fa-solid fa-folder" style="color: #4a90e2;"></i><span>${name}</span>`;
                item.addEventListener('dblclick', () => {
                    const newPath = path === '/' ? '/' + name : path + '/' + name;
                    navigateToFilePath(explorerId, newPath);
                });
            } else {
                const ext = name.split('.').pop().toLowerCase();
                let icon = 'fa-file';
                if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
                    icon = 'fa-file-image';
                } else if (['js', 'html', 'css', 'json', 'py', 'java'].includes(ext)) {
                    icon = 'fa-file-code';
                } else if (['txt', 'md'].includes(ext)) {
                    icon = 'fa-file-lines';
                }
                
                item.innerHTML = `<i class="fa-solid ${icon}" style="color: #ffa500;"></i><span>${name}</span>`;
                item.addEventListener('dblclick', () => {
                    const filePath = path === '/' ? '/' + name : path + '/' + name;
                    openFileInEditor(filePath);
                });
            }
            
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showFileContextMenu(e, explorerId, path, name, child.type);
            });
            
            content.appendChild(item);
        });
    }
}

function showFileContextMenu(e, explorerId, path, fileName, fileType) {
    const contextMenu = document.getElementById('context-menu');
    contextMenu.innerHTML = '';
    
    const menuItems = [];
    
    if (fileType === 'file') {
        menuItems.push({ icon: 'fa-solid fa-edit', text: 'Edit', action: () => {
            const filePath = path === '/' ? '/' + fileName : path + '/' + fileName;
            openFileInEditor(filePath);
        }});
        menuItems.push({ icon: 'fa-solid fa-download', text: 'Download', action: () => {
            const filePath = path === '/' ? '/' + fileName : path + '/' + fileName;
            downloadFile(filePath);
        }});
    } else {
        menuItems.push({ icon: 'fa-solid fa-folder-open', text: 'Open', action: () => {
            const folderPath = path === '/' ? '/' + fileName : path + '/' + fileName;
            navigateToFilePath(explorerId, folderPath);
        }});
    }
    
    menuItems.push({ separator: true });
    menuItems.push({ icon: 'fa-solid fa-trash', text: 'Delete', action: () => {
        if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
            deleteFileInPath(path, fileName);
            navigateToFilePath(explorerId, path);
            updateFileTree(explorerId);
        }
    }});
    
    menuItems.forEach(item => {
        if (item.separator) {
            contextMenu.appendChild(document.createElement('div')).className = 'context-menu-separator';
        } else {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.innerHTML = `<i class="${item.icon}"></i><span>${item.text}</span>`;
            menuItem.addEventListener('click', () => {
                item.action();
                hideContextMenu();
            });
            contextMenu.appendChild(menuItem);
        }
    });
    
    const rect = contextMenu.getBoundingClientRect();
    let x = e.clientX, y = e.clientY;
    if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width;
    if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height;
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.style.display = 'block';
}

window.fileExplorerGoUp = (explorerId) => {
    const currentPath = window.fileExplorers[explorerId].currentPath;
    if (currentPath === '/') return;
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    navigateToFilePath(explorerId, parentPath);
};

window.fileExplorerRefresh = (explorerId) => {
    const currentPath = window.fileExplorers[explorerId].currentPath;
    navigateToFilePath(explorerId, currentPath);
    updateFileTree(explorerId);
};

window.fileExplorerNewFolder = (explorerId) => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;
    
    const currentPath = window.fileExplorers[explorerId].currentPath;
    if (createFileInPath(currentPath, folderName, '', 'folder')) {
        navigateToFilePath(explorerId, currentPath);
        updateFileTree(explorerId);
    }
};

window.fileExplorerNewFile = (explorerId) => {
    const fileName = prompt('Enter file name (e.g., document.txt):');
    if (!fileName) return;
    
    const currentPath = window.fileExplorers[explorerId].currentPath;
    if (createFileInPath(currentPath, fileName, '')) {
        navigateToFilePath(explorerId, currentPath);
        updateFileTree(explorerId);
    }
};

window.fileExplorerUpload = (explorerId) => {
    const input = document.getElementById(`file-upload-input-${explorerId}`);
    input.onchange = (e) => {
        const files = e.target.files;
        const currentPath = window.fileExplorers[explorerId].currentPath;
        
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                if (createFileInPath(currentPath, file.name, content)) {
                    navigateToFilePath(explorerId, currentPath);
                    updateFileTree(explorerId);
                }
            };
            reader.readAsText(file);
        });
    };
    input.click();
};

function openFileInEditor(filePath) {
    const file = getNodeAtPath(filePath);
    if (!file || file.type !== 'file') return;
    
    const fileName = filePath.split('/').pop();
    const ext = fileName.split('.').pop().toLowerCase();
    
    let language = 'plaintext';
    if (['js', 'javascript'].includes(ext)) language = 'javascript';
    else if (ext === 'html') language = 'html';
    else if (ext === 'css') language = 'css';
    else if (ext === 'json') language = 'json';
    else if (ext === 'py') language = 'python';
    else if (ext === 'java') language = 'java';
    else if (ext === 'md') language = 'markdown';
    
    createWindow({
        title: `Edit: ${fileName}`,
        width: 900,
        height: 600,
        html: `
            <style>
                .editor-container { display: flex; flex-direction: column; height: 100%; background: #1e1e1e; }
                .editor-toolbar { background: #252526; padding: 10px; border-bottom: 1px solid #3e3e42; display: flex; gap: 10px; }
                .editor-content { flex: 1; overflow: hidden; }
                #editor-textarea { width: 100%; height: 100%; background: #1e1e1e; color: #d4d4d4; border: none; padding: 15px; font-family: 'Fira Code', monospace; font-size: 14px; resize: none; }
            </style>
            <div class="editor-container">
                <div class="editor-toolbar">
                    <button class="os-button" onclick="saveEditorFile('${filePath}')"><i class="fa-solid fa-save"></i> Save</button>
                    <button class="os-button" onclick="downloadEditorFile('${filePath}')"><i class="fa-solid fa-download"></i> Download</button>
                    <span style="color: #888; margin-left: auto; font-size: 12px;">Language: ${language}</span>
                </div>
                <div class="editor-content">
                    <textarea id="editor-textarea">${file.content || ''}</textarea>
                </div>
            </div>
        `
    });
}

window.saveEditorFile = (filePath) => {
    const textarea = document.getElementById('editor-textarea');
    if (!textarea) return;
    
    const file = getNodeAtPath(filePath);
    if (!file) return;
    
    file.content = textarea.value;
    file.size = new Blob([textarea.value]).size;
    file.modified = new Date().toISOString();
    saveFileSystem();
    
    alert('File saved!');
};

window.downloadEditorFile = (filePath) => {
    downloadFile(filePath);
};

function downloadFile(filePath) {
    const file = getNodeAtPath(filePath);
    if (!file || file.type !== 'file') return;
    
    const fileName = filePath.split('/').pop();
    const blob = new Blob([file.content || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function updateTaskbar() { 
    const taskbarApps = document.getElementById('taskbar-apps');
    taskbarApps.innerHTML = ''; 
    
    const appsToShow = new Set();
    apps.filter(app => app.pinnedToTaskbar).forEach(app => appsToShow.add(app.name));
    Object.values(openWindows).forEach(win => appsToShow.add(win.appName));
    
    appsToShow.forEach(appName => {
        const app = apps.find(a => a.name === appName);
        if (!app) return;
        
        const windowId = Object.keys(openWindows).find(id => openWindows[id].appName === appName);
        const windowData = windowId ? openWindows[windowId] : null;
        
        const taskbarItem = document.createElement('div'); 
        taskbarItem.className = 'taskbar-app'; 
        taskbarItem.dataset.appName = app.name;
        
        if (windowData) {
            if (windowData.minimized) taskbarItem.classList.add('minimized');
            if (windowData.focused) taskbarItem.classList.add('active');
        }
        
        const isImageIcon = app.icon.endsWith(".png") || app.icon.endsWith(".jpg") || app.icon.endsWith(".svg");
        taskbarItem.innerHTML = isImageIcon ? `<img src="${app.icon}" style="height: 28px; width: 28px;">` : `<i class="${app.icon}"></i>`;
        
        taskbarItem.addEventListener('click', () => { 
            if (windowData) {
                if (windowData.minimized) { restoreWindow(windowId); } 
                else if (windowData.focused) { minimizeWindow(windowId); }
                else { focusWindow(windowId); }
            } else {
                launchApp(appName);
            }
        }); 
        
        taskbarItem.addEventListener('contextmenu', (e) => showContextMenu(e, { type: 'taskbar-app', appName: app.name }));
        taskbarApps.appendChild(taskbarItem);
    }); 
}

function launchApp(appName) {
    const existingWindowId = Object.keys(openWindows).find(id => openWindows[id].appName === appName);
    if (existingWindowId) { 
        const winData = openWindows[existingWindowId]; 
        if (winData.minimized) { 
            restoreWindow(existingWindowId); 
        } else { 
            focusWindow(existingWindowId); 
        } 
        return; 
    }
    
    const app = apps.find(a => a.name === appName); 
    if (!app) { 
        console.error('App not found:', appName); 
        return; 
    }
    
    const windowOptions = { title: app.name, appName: app.name, width: 800, height: 600 };
    const pr0xyUrl = (url) => `embed.html#${url.startsWith('http') ? url : 'https://' + url}`;
    
    if (app.type === 'action') { 
        if (window[app.content]) { 
            const windowId = window[app.content](windowOptions);
            if (app.isGame) {
                enhanceGameWindow(windowId, app.name, app.name);
            }
        } 
    } else if (app.type === 'proxied_url') { 
        windowOptions.url = pr0xyUrl(app.content); 
        createWindow(windowOptions); 
    } else if (app.type === 'iframe') { 
        windowOptions.url = app.content; 
        const windowId = createWindow(windowOptions);
        if (app.isGame) {
            const gameId = app.id || app.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            enhanceGameWindow(windowId, gameId, app.name);
        }
    }
}

function openTerminal(options) {
    if (!options) {
        options = {};
    }
    options.width = options.width || 900;
    options.height = options.height || 600;
    options.title = options.title || 'JSLinux Terminal';
    
    var terminalId = 'terminal-' + Date.now();
    var htmlContent = '';
    
    htmlContent += '<div class="jslinux-terminal-container" style="';
    htmlContent += 'width: 100%; height: 100%; background: #000; ';
    htmlContent += 'display: flex; flex-direction: column; font-family: monospace;';
    htmlContent += '">';
    
    htmlContent += '<div class="terminal-header" style="';
    htmlContent += 'background: #1a1a1a; border-bottom: 1px solid #333; ';
    htmlContent += 'padding: 8px 12px; display: flex; align-items: center; ';
    htmlContent += 'justify-content: space-between; min-height: 35px;';
    htmlContent += '">';
    
    htmlContent += '<div style="display: flex; align-items: center; gap: 8px;">';
    htmlContent += '<div style="color: #00ff00; font-size: 12px; font-weight: bold;">JSLinux Terminal</div>';
    htmlContent += '<div id="status-' + terminalId + '" style="';
    htmlContent += 'font-size: 10px; color: #888; padding: 2px 6px; ';
    htmlContent += 'background: #222; border-radius: 3px; border-left: 2px solid #ff6b35;';
    htmlContent += '">Initializing...</div>';
    htmlContent += '</div>';
    
    htmlContent += '<div style="display: flex; gap: 6px;">';
    htmlContent += '<button onclick="restartJSLinux(\'' + terminalId + '\')" style="';
    htmlContent += 'background: #444; border: 1px solid #666; color: #fff; ';
    htmlContent += 'padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;';
    htmlContent += '">Restart</button>';
    htmlContent += '<button onclick="fullscreenTerminal(\'' + terminalId + '\')" style="';
    htmlContent += 'background: #444; border: 1px solid #666; color: #fff; ';
    htmlContent += 'padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;';
    htmlContent += '">Fullscreen</button>';
    htmlContent += '</div>';
    htmlContent += '</div>';
    
    htmlContent += '<div id="loading-' + terminalId + '" style="';
    htmlContent += 'flex: 1; display: flex; flex-direction: column; ';
    htmlContent += 'align-items: center; justify-content: center; ';
    htmlContent += 'background: #000; color: #00ff00;';
    htmlContent += '">';
    
    htmlContent += '<div style="text-align: center; margin-bottom: 20px;">';
    htmlContent += '<div style="font-size: 24px; margin-bottom: 10px;">JSLinux</div>';
    htmlContent += '<div style="font-size: 12px; color: #888;">Loading Linux environment...</div>';
    htmlContent += '</div>';
    
    htmlContent += '<div class="loading-animation" style="';
    htmlContent += 'width: 200px; height: 4px; background: #222; ';
    htmlContent += 'border-radius: 2px; overflow: hidden; margin-bottom: 15px;';
    htmlContent += '">';
    htmlContent += '<div id="loading-bar-' + terminalId + '" style="';
    htmlContent += 'width: 0%; height: 100%; background: #00ff00; ';
    htmlContent += 'transition: width 0.3s ease; border-radius: 2px;';
    htmlContent += '"></div>';
    htmlContent += '</div>';
    
    htmlContent += '<div id="loading-text-' + terminalId + '" style="';
    htmlContent += 'font-size: 11px; color: #666; text-align: center;';
    htmlContent += '">Initializing system...</div>';
    htmlContent += '</div>';
    
    htmlContent += '<div id="jslinux-container-' + terminalId + '" style="';
    htmlContent += 'flex: 1; display: none; position: relative;';
    htmlContent += '">';
    htmlContent += '<iframe id="jslinux-frame-' + terminalId + '" ';
    htmlContent += 'src="https://bellard.org/jslinux/vm.html?url=https://bellard.org/jslinux/buildroot-x86.cfg" ';
    htmlContent += 'style="width: 100%; height: 100%; border: none; background: #000;" ';
    htmlContent += 'onload="handleJSLinuxLoad(\'' + terminalId + '\')" ';
    htmlContent += 'onerror="handleJSLinuxError(\'' + terminalId + '\')"></iframe>';
    htmlContent += '</div>';
    
    htmlContent += '<div id="error-' + terminalId + '" style="';
    htmlContent += 'flex: 1; display: none; flex-direction: column; ';
    htmlContent += 'align-items: center; justify-content: center; ';
    htmlContent += 'background: #000; color: #ff6b35; text-align: center;';
    htmlContent += '">';
    htmlContent += '<div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>';
    htmlContent += '<div style="font-size: 14px; margin-bottom: 20px; max-width: 400px;">';
    htmlContent += 'Failed to load JSLinux. This might be due to network issues or browser restrictions.';
    htmlContent += '</div>';
    htmlContent += '<div style="display: flex; gap: 10px;">';
    htmlContent += '<button onclick="retryJSLinux(\'' + terminalId + '\')" style="';
    htmlContent += 'background: #ff6b35; border: none; color: white; ';
    htmlContent += 'padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px;';
    htmlContent += '">Retry</button>';
    htmlContent += '<button onclick="useFallbackTerminal(\'' + terminalId + '\')" style="';
    htmlContent += 'background: #444; border: 1px solid #666; color: #fff; ';
    htmlContent += 'padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px;';
    htmlContent += '">Use Fallback Terminal</button>';
    htmlContent += '</div>';
    htmlContent += '</div>';
    
    htmlContent += '</div>';
    
    htmlContent += '<style>';
    htmlContent += '@keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }';
    htmlContent += '.loading-animation { animation: pulse 2s infinite; }';
    htmlContent += '</style>';
    
    options.html = htmlContent;
    var window = createWindow(options);
    
    setTimeout(function() {
        startLoadingSequence(terminalId);
    }, 100);
    
    return window;
}

function startLoadingSequence(terminalId) {
    var loadingSteps = [
        { progress: 10, text: 'Initializing system...' },
        { progress: 25, text: 'Loading kernel...' },
        { progress: 40, text: 'Mounting filesystem...' },
        { progress: 60, text: 'Starting services...' },
        { progress: 80, text: 'Preparing terminal...' },
        { progress: 95, text: 'Almost ready...' },
        { progress: 100, text: 'Complete!' }
    ];
    
    var currentStep = 0;
    
    function updateProgress() {
        if (currentStep >= loadingSteps.length) {
            setTimeout(function() {
                showJSLinux(terminalId);
            }, 500);
            return;
        }
        
        var step = loadingSteps[currentStep];
        var progressBar = document.getElementById('loading-bar-' + terminalId);
        var loadingText = document.getElementById('loading-text-' + terminalId);
        var statusElement = document.getElementById('status-' + terminalId);
        
        if (progressBar) {
            progressBar.style.width = step.progress + '%';
        }
        if (loadingText) {
            loadingText.textContent = step.text;
        }
        if (statusElement) {
            statusElement.textContent = step.text;
        }
        
        currentStep++;
        var delay = Math.random() * 500 + 300;
        setTimeout(updateProgress, delay);
    }
    
    updateProgress();
}

function showJSLinux(terminalId) {
    var loadingElement = document.getElementById('loading-' + terminalId);
    var jslinuxContainer = document.getElementById('jslinux-container-' + terminalId);
    var statusElement = document.getElementById('status-' + terminalId);
    
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    if (jslinuxContainer) {
        jslinuxContainer.style.display = 'flex';
    }
    if (statusElement) {
        statusElement.textContent = 'Running';
        statusElement.style.borderLeftColor = '#00ff00';
        statusElement.style.color = '#00ff00';
    }
    
    console.log('JSLinux terminal loaded successfully');
}

window.handleJSLinuxLoad = function(terminalId) {
    console.log('JSLinux iframe loaded');
};

window.handleJSLinuxError = function(terminalId) {
    console.error('JSLinux failed to load');
    showError(terminalId);
};

function showError(terminalId) {
    var loadingElement = document.getElementById('loading-' + terminalId);
    var errorElement = document.getElementById('error-' + terminalId);
    var statusElement = document.getElementById('status-' + terminalId);
    
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    if (errorElement) {
        errorElement.style.display = 'flex';
    }
    if (statusElement) {
        statusElement.textContent = 'Error';
        statusElement.style.borderLeftColor = '#ff6b35';
        statusElement.style.color = '#ff6b35';
    }
}

window.retryJSLinux = function(terminalId) {
    var errorElement = document.getElementById('error-' + terminalId);
    var loadingElement = document.getElementById('loading-' + terminalId);
    
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    if (loadingElement) {
        loadingElement.style.display = 'flex';
    }
    
    setTimeout(function() {
        startLoadingSequence(terminalId);
    }, 100);
};

window.restartJSLinux = function(terminalId) {
    var jslinuxFrame = document.getElementById('jslinux-frame-' + terminalId);
    if (jslinuxFrame) {
        jslinuxFrame.src = jslinuxFrame.src;
    }
    
    var jslinuxContainer = document.getElementById('jslinux-container-' + terminalId);
    var loadingElement = document.getElementById('loading-' + terminalId);
    
    if (jslinuxContainer) {
        jslinuxContainer.style.display = 'none';
    }
    if (loadingElement) {
        loadingElement.style.display = 'flex';
    }
    
    setTimeout(function() {
        startLoadingSequence(terminalId);
    }, 100);
};

window.fullscreenTerminal = function(terminalId) {
    var jslinuxFrame = document.getElementById('jslinux-frame-' + terminalId);
    if (jslinuxFrame) {
        if (jslinuxFrame.requestFullscreen) {
            jslinuxFrame.requestFullscreen();
        } else if (jslinuxFrame.webkitRequestFullscreen) {
            jslinuxFrame.webkitRequestFullscreen();
        } else if (jslinuxFrame.msRequestFullscreen) {
            jslinuxFrame.msRequestFullscreen();
        }
    }
};

window.useFallbackTerminal = function(terminalId) {
    var errorElement = document.getElementById('error-' + terminalId);
    var jslinuxContainer = document.getElementById('jslinux-container-' + terminalId);
    
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    if (jslinuxContainer) {
        jslinuxContainer.innerHTML = createFallbackTerminal(terminalId);
        jslinuxContainer.style.display = 'flex';
    }
    
    var statusElement = document.getElementById('status-' + terminalId);
    if (statusElement) {
        statusElement.textContent = 'Fallback Mode';
        statusElement.style.borderLeftColor = '#ffaa00';
        statusElement.style.color = '#ffaa00';
    }
};

function createFallbackTerminal(terminalId) {
    var fallbackHtml = '';
    fallbackHtml += '<div style="flex: 1; background: #000; color: #00ff00; padding: 20px; font-family: monospace; overflow-y: auto;">';
    fallbackHtml += '<div id="fallback-output-' + terminalId + '" style="white-space: pre-wrap; margin-bottom: 10px;">';
    fallbackHtml += 'JSLinux Fallback Terminal\n';
    fallbackHtml += 'Type "help" for available commands\n\n';
    fallbackHtml += 'user@jslinux:~$ ';
    fallbackHtml += '</div>';
    fallbackHtml += '<div style="display: flex; align-items: center;">';
    fallbackHtml += '<span style="color: #00ff00;">user@jslinux:~$ </span>';
    fallbackHtml += '<input id="fallback-input-' + terminalId + '" type="text" style="';
    fallbackHtml += '<input id="fallback-input-' + terminalId + '" type="text" style="';
    fallbackHtml += 'flex: 1; background: transparent; border: none; color: #00ff00; ';
    fallbackHtml += 'font-family: monospace; outline: none; margin-left: 5px;';
    fallbackHtml += '" onkeypress="handleFallbackCommand(event, \'' + terminalId + '\')">';
    fallbackHtml += '</div>';
    fallbackHtml += '</div>';
    return fallbackHtml;
}

window.handleFallbackCommand = function(event, terminalId) {
    if (event.key === 'Enter') {
        var input = document.getElementById('fallback-input-' + terminalId);
        var output = document.getElementById('fallback-output-' + terminalId);
        
        if (input && output) {
            var command = input.value.trim();
            var response = processFallbackCommand(command);
            
            output.textContent += command + '\n' + response + '\nuser@jslinux:~$ ';
            input.value = '';
            output.scrollTop = output.scrollHeight;
        }
    }
};

function openPaint(options) { 
    options.width=800; 
    options.height=600; 
    options.html=`<div class="paint-app" style="display: flex; flex-direction: column; height: 100%; background: #555;">
                    <div class="paint-toolbar" style="padding: 5px; background: var(--header-bg); flex-shrink: 0; display: flex; align-items: center; gap: 8px;">
                        <button class="os-button" onclick="setPaintTool('brush')"><i class="fa-solid fa-paintbrush"></i></button>
                        <button class="os-button" onclick="setPaintTool('eraser')"><i class="fa-solid fa-eraser"></i></button>
                        <input type="color" id="paint-color" value="#FFFFFF">
                        <input type="range" id="paint-size" min="1" max="50" value="5">
                        <button class="os-button" onclick="clearPaintCanvas()">Clear</button>
                        <button class="os-button" onclick="savePaintImage()">Save</button>
                    </div>
                    <div class="paint-canvas-container" style="flex-grow: 1; overflow: hidden; position: relative;">
                        <canvas id="paint-canvas" style="position: absolute; top: 0; left: 0;"></canvas>
                    </div>
                  </div>`; 
    createWindow(options); 
    setTimeout(initPaint, 100); 
} 

window.paintCtx = null; 
window.paintTool='brush'; 
window.painting=false; 

function initPaint() { 
    const canvas = document.getElementById('paint-canvas'); 
    if (!canvas) return; 
    const container = canvas.parentElement;
    window.paintCtx = canvas.getContext('2d'); 
    let painting = false;
    
    const resizeCanvas = () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        if(canvas.width > 0 && canvas.height > 0) {
            tempCtx.drawImage(canvas, 0, 0);
        }
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        window.paintCtx.fillStyle = 'white';
        window.paintCtx.fillRect(0, 0, canvas.width, canvas.height);
        window.paintCtx.drawImage(tempCanvas, 0, 0);
    };
    
    resizeCanvas();
    
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);
    
    const getCoords = (e) => {
        const rect = canvas.getBoundingClientRect();
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    
    const startPaint = (e) => {
        e.preventDefault();
        painting = true;
        const { x, y } = getCoords(e);
        window.paintCtx.beginPath();
        window.paintCtx.moveTo(x, y);
    };
    
    const stopPaint = () => {
        painting = false;
    };
    
    const paint = (e) => {
        if (!painting) return;
        e.preventDefault();
        const { x, y } = getCoords(e);
        window.paintCtx.lineWidth = document.getElementById('paint-size').value; 
        window.paintCtx.lineCap = 'round'; 
        window.paintCtx.strokeStyle = document.getElementById('paint-color').value; 
        window.paintCtx.globalCompositeOperation = window.paintTool === 'eraser' ? 'destination-out' : 'source-over';
        window.paintCtx.lineTo(x, y);
        window.paintCtx.stroke();
    };
    
    canvas.addEventListener('mousedown', startPaint);
    canvas.addEventListener('mouseup', stopPaint);
    canvas.addEventListener('mouseout', stopPaint);
    canvas.addEventListener('mousemove', paint);
    canvas.addEventListener('touchstart', startPaint, { passive: false });
    canvas.addEventListener('touchend', stopPaint);
    canvas.addEventListener('touchcancel', stopPaint);
    canvas.addEventListener('touchmove', paint, { passive: false });
} 

window.setPaintTool = function(tool){ window.paintTool=tool; };

window.clearPaintCanvas = function() { 
    const canvas=document.getElementById('paint-canvas'); 
    if(canvas && window.paintCtx){ 
        window.paintCtx.clearRect(0,0,canvas.width,canvas.height); 
        window.paintCtx.fillStyle='white'; 
        window.paintCtx.fillRect(0,0,canvas.width,canvas.height);
    }
};

window.savePaintImage = function() { 
    const canvas=document.getElementById('paint-canvas'); 
    const a=document.createElement('a'); 
    a.download = 'luminal-paint.png'; 
    a.href = canvas.toDataURL('image/png'); 
    a.click(); 
};

function createSafeId(title) {
    if (!title) return '';
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

function openG3meLibrary(options) {
    options.width = 1100;
    options.height = 700;
    options.title = "Game Library";
    options.html = `
        <style>
            .gl-container * { box-sizing: border-box; }
            .gl-container { padding: 15px; height: 100%; overflow-y: auto; font-family: 'Poppins', sans-serif; }
            .gl-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
            .gl-page-title { font-size: 1.8rem; font-weight: 600; display: flex; align-items: center; gap: 15px; background: linear-gradient(45deg, var(--accent-color), #6c5ce7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .gl-search-box { padding: 10px 15px; border: 1px solid var(--input-border); border-radius: 8px; background: var(--input-bg); color: var(--text-color); font-family: 'Poppins', sans-serif; width: 250px; }
            .gl-stats-bar { background: rgba(0,0,0,0.15); padding: 12px 18px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #ccc; }
            .gl-games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
            .gl-game-card { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; overflow: hidden; transition: all 0.3s ease; display: flex; flex-direction: column; position: relative; }
            .gl-game-card:hover { transform: translateY(-8px); box-shadow: 0 15px 30px rgba(0,0,0,0.3); border-color: var(--accent-color); }
            .gl-thumbnail-container { width: 100%; height: 160px; overflow: hidden; background: #333; }
            .gl-game-thumb { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
            .gl-game-card:hover .gl-game-thumb { transform: scale(1.1); }
            .gl-game-info { padding: 15px; display: flex; flex-direction: column; flex-grow: 1; }
            .gl-game-title { font-size: 1rem; font-weight: 500; margin-bottom: 10px; flex-grow: 1; }
            .gl-game-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
            .gl-upvote-btn { background: none; border: 1px solid #888; color: #ccc; padding: 5px 10px; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-size: 12px; display: flex; align-items: center; gap: 5px;}
            .gl-upvote-btn:hover { background: rgba(255,255,255,0.1); border-color: #fff; }
            .gl-upvote-btn.upvoted { background: var(--accent-color); color: white; border-color: var(--accent-color); }
            .gl-btn-group { display: flex; gap: 8px; }
            .gl-play-btn, .gl-add-btn { color: #fff; border: none; padding: 10px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.8rem; font-weight: 500; flex: 1; }
            .gl-play-btn { background: var(--accent-color); }
            .gl-add-btn { background: rgba(255,255,255,0.2); }
            .gl-play-btn:hover, .gl-add-btn:hover { filter: brightness(1.2); }
            .gl-message { text-align: center; font-size: 1.1rem; padding: 60px 20px; grid-column: 1 / -1; color: #888; }
        </style>
        <div class="gl-container">
            <header class="gl-header">
                <h1 class="gl-page-title"><i class="fa-solid fa-gamepad"></i> Game Library</h1>
                <input class="gl-search-box" id="gl-search-box" placeholder="Search games..." type="text"/>
            </header>
            <div class="gl-stats-bar">
                <span><span id="gl-total-games">0</span> games available</span>
                <span>Powered by luminalOS</span>
            </div>
            <main class="gl-games-grid" id="gl-games-container"><div class="gl-message">Loading Game Library...</div></main>
        </div>
    `;
    
    const windowId = createWindow(options);
    setTimeout(() => initializeGameLibrary(windowId), 50);
}

function initializeGameLibrary(windowId) {
    const gameWindow = document.getElementById(windowId);
    if (!gameWindow) return;
    
    const container = gameWindow.querySelector('#gl-games-container');
    const searchBox = gameWindow.querySelector('#gl-search-box');
    const totalGamesEl = gameWindow.querySelector('#gl-total-games');
    
    let allGames = [];
    let userUpvotedGames = JSON.parse(localStorage.getItem('luminal_upvoted_games')) || [];

    
    async function fetchGames() {
        try {
            const [gamesResponse, upvotesResponse] = await Promise.all([
                fetch('g3mes.json'),
                fetch('/api/games/upvotes')
            ]);

            if (!gamesResponse.ok) throw new Error(`HTTP error! Status: ${gamesResponse.status}`);
            const rawGames = await gamesResponse.json();
            const upvotes = await upvotesResponse.json();

            allGames = rawGames.map(game => ({
                ...game,
                id: createSafeId(game.title),
                upvotes: upvotes[createSafeId(game.title)] || 0
            }));
            
            sortAndRenderGames(allGames);
            totalGamesEl.textContent = allGames.length;

        } catch (error) {
            console.error('Game Library Fetch Error:', error);
            container.innerHTML = '<div class="gl-message">Error: Could not load g3mes.json.</div>';
        }
    }
    
    function sortAndRenderGames(games) {
        games.sort((a, b) => b.upvotes - a.upvotes);
        renderGames(games);
    }
    
function renderGames(games) {
    container.innerHTML = games.length ? '' : '<div class="gl-message">No games found.</div>';
    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'gl-game-card';
        const safeTitle = game.title.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const isUpvoted = userUpvotedGames.includes(game.id);

        card.innerHTML = `
            <div class="gl-thumbnail-container"><img src="${game.imgsrc}" alt="${game.title}" class="gl-game-thumb" onerror="this.src='https://via.placeholder.com/280x180/4a90e2/ffffff?text=' + encodeURIComponent('${safeTitle}')"></div>
            <div class="gl-game-info">
                <h3 class="gl-game-title">${game.title}</h3>
                <div class="gl-game-meta">
                    <button class="gl-upvote-btn ${isUpvoted ? 'upvoted' : ''}" data-game-id="${game.id}">
                        <i class="fa-solid fa-arrow-up"></i>
                        <span class="gl-upvote-count">${game.upvotes}</span>
                    </button>
                </div>
                <div class="gl-btn-group">
                    <button class="gl-play-btn"><i class="fa-solid fa-play"></i> Play</button>
                    <button class="gl-add-btn"><i class="fa-solid fa-plus"></i> Add</button>
                </div>
            </div>
        `;
        
        const playBtn = card.querySelector('.gl-play-btn');
        const addBtn = card.querySelector('.gl-add-btn');
        const upvoteBtn = card.querySelector('.gl-upvote-btn');
        
        playBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            playGameInOS(game.link, game.title);
        });
        
        addBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Add button clicked for game:', game);
    addG3meToDesktop(game);
});;
        
        upvoteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            upvoteGame(e.currentTarget, game.id);
        });
        
        container.appendChild(card);
    });
}

    async function upvoteGame(button, gameId) {
        if (userUpvotedGames.includes(gameId)) return;

        try {
            const response = await fetch('/api/games/upvote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: gameId })
            });

            if (!response.ok) throw new Error('Failed to upvote');

            const { newUpvotes } = await response.json();
            
            userUpvotedGames.push(gameId);
            localStorage.setItem('luminal_upvoted_games', JSON.stringify(userUpvotedGames));

            button.classList.add('upvoted');
            button.querySelector('.gl-upvote-count').textContent = newUpvotes;

            const game = allGames.find(g => g.id === gameId);
            if(game) game.upvotes = newUpvotes;

            sortAndRenderGames(allGames.filter(g => g.title.toLowerCase().includes(searchBox.value.toLowerCase())));

        } catch (error) {
            console.error('Upvote error:', error);
            alert('Could not register upvote. Please try again later.');
        }
    }

const playGameInOS = (gameUrl, gameTitle) => {
    const gameId = createSafeId(gameTitle);
    const windowId = createWindow({
        title: gameTitle,
        appName: gameTitle,
        width: 768,
        height: 500,
        html: `<div style="width:100%; height:100%; display:flex; flex-direction:column; background:#000;">
                   <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; color:white; z-index:2;" id="loader-${gameId}">
                       <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
                       <p style="margin-top:10px;">Loading game...</p>
                       <button class="os-button" style="position:absolute; bottom:20px; right:20px; background-color: #c0392b;" onclick="showReportModal('${gameTitle.replace(/'/g, "\\'")}')">
                           <i class="fa-solid fa-flag"></i> Report Issue
                       </button>
                   </div>
                   <iframe id="iframe-${gameId}" src="${gameUrl}" style="width:100%; flex-grow:1; border:none; position:relative; z-index:1;" onload="document.getElementById('loader-${gameId}').style.display='none'">
                   </iframe>
               </div>`
    });

    enhanceGameWindow(windowId, gameId, gameTitle);
};
    
    searchBox.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        renderGames(allGames.filter(g => g.title.toLowerCase().includes(query)));
    });
    
    fetchGames();
}

function addG3meToDesktop(gameData) {
    console.log('addG3meToDesktop called with:', gameData);
    
    if (!gameData || !gameData.title) {
        console.error('Invalid gameData:', gameData);
        alert('Error: Invalid game data');
        return;
    }
    
    const gameId = createSafeId(gameData.title);
    console.log('Game ID created:', gameId);
    
    const existingApp = apps.find(app => app.id === gameId);
    console.log('Existing app check:', existingApp);
    
    if (existingApp) {
        alert(`"${gameData.title}" is already on your desktop!`);
        return;
    }
    
    const newApp = {
        id: gameId,
        name: gameData.title,
        icon: gameData.imgsrc,
        type: 'iframe',
        content: gameData.link,
        pinned: true,
        pinnedToTaskbar: false,
        isCustom: true,
        isGame: true 
    };
    
    console.log('New app object:', newApp);
    console.log('Current apps array before push:', apps);
    
    apps.push(newApp);
    console.log('Current apps array after push:', apps);
    
    saveApps();
    console.log('Apps saved to localStorage');
    
    renderDesktopIcons();
    console.log('Desktop icons rendered');
    
    renderAppList();
    console.log('App list rendered');
    
    alert(`Added "${gameData.title}" to your desktop.`);
}

function enhanceGameWindow(windowId, gameId, gameTitle) {
    const windowData = openWindows[windowId];
    if (!windowData || !windowData.element) return;
    
    const gameIframe = windowData.iframeRef;
    if (!gameIframe) return;

    const autoSaveInterval = setInterval(() => {
        console.log(`Auto-saving progress for ${gameTitle}...`);
        gameIframe.contentWindow.postMessage({ type: 'request-save-data' }, '*');
    }, 60000); 
    
    const messageHandler = (event) => {
        if (event.source !== gameIframe.contentWindow) return;
        const { type, payload } = event.data;
        if (type === 'save-data-response' && payload) {
            console.log(`Received save data from ${gameTitle}.`);
            localStorage.setItem(`luminal_game_save_${gameId}`, payload);
        }
    };
    
    window.addEventListener('message', messageHandler);

    const closeBtn = windowData.element.querySelector('.window-control.close');
    const originalOnclick = closeBtn.onclick;

    closeBtn.onclick = () => {
        if (confirm(`Do you want to save your progress in "${gameTitle}" before closing?`)) {
            gameIframe.contentWindow.postMessage({ type: 'request-save-data' }, '*');
            setTimeout(() => {
                originalOnclick();
            }, 500);
        } else {
            originalOnclick();
        }
    };
    
    openWindows[windowId].onClose = () => {
        clearInterval(autoSaveInterval);
        window.removeEventListener('message', messageHandler);
    };
    
    const savedData = localStorage.getItem(`luminal_game_save_${gameId}`);
}


function showReportModal(gameTitle) {
    const modalId = 'report-modal-overlay';
    const existingModal = document.getElementById(modalId);
    if (existingModal) existingModal.remove();
    
    const overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(5px); z-index:100000; display:flex; align-items:center; justify-content:center;';
    overlay.innerHTML = `
        <div class="startup-modal" style="width: 400px; text-align: left;">
            <h3 style="margin-top:0;">Report Issue with: ${gameTitle}</h3>
            <p style="font-size:14px; color:#ccc;">Describe the problem (e.g., "doesn't load", "crashes on level 2", "buttons don't work").</p>
            <textarea id="report-reason" class="settings-input" style="width:100%; height: 100px; resize: vertical;" placeholder="Please be as specific as possible..."></textarea>
            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:15px;">
                <button class="os-button" style="background-color:#555;" onclick="document.getElementById('${modalId}').remove()">Cancel</button>
                <button class="os-button" onclick="sendReport('${gameTitle}')">Send Report</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('report-reason').focus();
}

async function sendReport(gameTitle) {
    const reason = document.getElementById('report-reason').value.trim();
    if (!reason) {
        alert("Please provide a reason for the report.");
        return;
    }
    
    const webhookUrl = 'https://discord.com/api/webhooks/1420591602996482049/A1EnGEISRvpLJMTSD7vKnEoql53WQ3QfYY7D2_bxVIrnw1_aXKKH0BhpUPFGbJWmCRMy';
    const payload = {
        username: "luminalOS Game Reporter",
        embeds: [{
            title: "New Game Report Received!",
            color: 15158332,
            fields: [
                { name: "Game Title", value: gameTitle, inline: true },
                { name: "Reported Reason", value: reason }
            ],
            timestamp: new Date().toISOString()
        }]
    };
    
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            alert("Report sent successfully. Thank you for your feedback!");
        } else {
            alert("Failed to send report. Please try again later.");
        }
    } catch (error) {
        console.error("Webhook error:", error);
        alert("An error occurred while sending the report.");
    }
    
    document.getElementById('report-modal-overlay').remove();
}
function zoomOut() {
  const pageBody = document.body;
  let currentZoom = parseFloat(pageBody.style.zoom) || 1; 

  currentZoom -= 0.1; 

  if (currentZoom < 0.5) { 
    currentZoom = 0.5; 
  }

  pageBody.style.zoom = currentZoom;
}

function openSettings(options) {
    const savedColor = localStorage.getItem('luminal_accent') || '#4a90e2';
    const savedBlur = localStorage.getItem('luminal_blur') || '20';
    const clockFormat = localStorage.getItem('luminal_clock_format') || '12';
    const iconSize = localStorage.getItem('luminal_iconSize') || 90;
    
    options.html = `
    <div style="padding: 10px; height: 100%; box-sizing: border-box; overflow-y: auto; color: var(--text-color);">
        <div style="padding: 10px;">
            <h3><i class="fa-solid fa-gear"></i> Settings</h3>
            <hr style="border-color: var(--window-border);">
            <h4><i class="fa-solid fa-palette"></i> Personalization</h4>
            <div style="padding-left: 20px;">
                <p>Accent Color:</p>
                <input type="color" value="${savedColor}" onchange="document.documentElement.style.setProperty('--accent-color', this.value); localStorage.setItem('luminal_accent', this.value);">
                <p style="margin-top:15px;">Themes:</p>
                <button class="os-button" onclick="applyTheme('dark')">Luminal Dark</button>
                <button class="os-button" onclick="applyTheme('light')">Luminal Light</button>
                <button class="os-button" onclick="applyTheme('classic')">Windows Classic</button>
                <p style="margin-top:15px;">Wallpaper:</p>
                <input type="text" class="settings-input" id="wallpaper-url-input" placeholder="Paste image URL..." style="width: calc(100% - 170px);">
                <button class="os-button" onclick="saveWallpaper()">Set URL</button>
                <button class="os-button" onclick="document.getElementById('wallpaper-file-input').click()">Browse...</button>
                <input type="file" id="wallpaper-file-input" accept="image/*" style="display: none;" onchange="setWallpaperFromFile(event)">
            </div>
            <hr style="margin-top:20px; border-color: var(--window-border);">
            <h4><i class="fa-solid fa-desktop"></i> Desktop & Taskbar</h4>
            <div style="padding-left: 20px;">
                <p>Icon Size: <span id="icon-size-label">${iconSize}px</span></p>
                <input type="range" min="60" max="120" value="${iconSize}" oninput="updateIconSize(this.value)">
                <p style="margin-top:15px;">Taskbar Blur: <span id="blur-label">${savedBlur}px</span></p>
                <input type="range" min="0" max="40" value="${savedBlur}" oninput="document.documentElement.style.setProperty('--taskbar-blur', this.value + 'px'); localStorage.setItem('luminal_blur', this.value); document.getElementById('blur-label').textContent = this.value + 'px';">
                <div style="margin-top: 20px;">
                    <button class='os-button' onclick='arrangeIcons()'>Arrange Icons</button>
                    <button class='os-button' onclick='resetIconPositions()'>Reset Icon Positions</button>
                    <button class='os-button' onclick='zoomOut()'>Zoom Out(reccomended)</button>
                </div>
            </div>
            <hr style="margin-top:20px; border-color: var(--window-border);">
            <h4><i class="fa-solid fa-floppy-disk"></i> Data Management</h4>
            <div style="padding-left: 20px;">
                 <p>Save or load your luminalOS settings, apps, and files.</p>
                 <button class="os-button" onclick="exportLumiSettings()">Export Settings (.lumi)</button>
                 <button class="os-button" onclick="document.getElementById('import-lumi-input').click()">Import Settings (.lumi)</button>
                 <input type="file" id="import-lumi-input" accept=".lumi" style="display: none;" onchange="importLumiSettings(event)">
                     
<div style="margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 5px; font-size: 13px; line-height: 1.6;">
    <strong>Saving & Loading Game Progress</strong>
    <p style="margin: 5px 0 10px 0;">Games automatically save for you, now downloading this .lumi custom file can let you transfer data between domains if one gets blocked!(join the discord at discord.luminal.cc for more links!)</p></div>
            <hr style="margin-top:20px; border-color: var(--window-border);">
            <h4><i class="fa-solid fa-user-secret"></i> Cloaking</h4>
            <div style="padding-left: 20px;">
                <p>Set tab to a preset:</p>
                <button class='os-button' onclick='cloakTab("classroom")'>Google Classroom</button>
                <button class='os-button' onclick='cloakTab("canvas")'>Canvas</button>
                <p style="margin-top:15px;">Open luminalOS in a new cloaked window:</p>
                <button class='os-button' onclick='openCloakedWindow("new_tab")'>New Tab</button>
                <button class='os-button' onclick='openCloakedWindow("google_classroom")'>Google Classroom</button>
                <button class='os-button' onclick='openCloakedWindow("clever")'>Clever</button>
            </div>
            <hr style="margin-top:20px; border-color: var(--window-border);">
            <h4><i class="fa-solid fa-cog"></i> System</h4>
             <div style="padding-left: 20px;">
                <p>Time Format:</p>
                <select class="settings-input" onchange="localStorage.setItem('luminal_clock_format', this.value); updateClock();">
                    <option value="12" ${clockFormat === '12' ? 'selected' : ''}>12-Hour</option>
                    <option value="24" ${clockFormat === '24' ? 'selected' : ''}>24-Hour</option>
                </select>
                 <br><br>
               <button class='os-button' onclick='resetLuminalOS()' style='background-color:#c0392b;'>Reset LuminalOS</button>
            </div>
        </div>
    </div>
    `;
    options.width = 500;
    options.height = 600;
    createWindow(options);
}

function exportLumiSettings() {
    const dataToSave = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('luminal_')) {
            dataToSave[key] = localStorage.getItem(key);
        }
    }
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luminalOS_backup_${new Date().toISOString().split('T')[0]}.lumi`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Settings exported successfully!');
}

function importLumiSettings(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.lumi')) {
        alert('Invalid file type. Please select a .lumi backup file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dataToLoad = JSON.parse(e.target.result);
            if (confirm('Are you sure you want to import these settings? This will overwrite your current configuration.')) {
                Object.keys(dataToLoad).forEach(key => {
                    if (key.startsWith('luminal_')) {
                        localStorage.setItem(key, dataToLoad[key]);
                    }
                });
                alert('Settings imported successfully! The page will now reload.');
                location.reload();
            }
        } catch (err) {
            alert('Failed to read or parse the settings file. It may be corrupted.');
            console.error('Import error:', err);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; 
}


function applyTheme(themeName) {
    document.body.className = `theme-${themeName}`;
    localStorage.setItem('luminal_theme', themeName);
}

function updateIconSize(value) {
    document.documentElement.style.setProperty('--icon-size', value + 'px');
    document.getElementById('icon-size-label').textContent = value + 'px';
    localStorage.setItem('luminal_iconSize', value);
}

function arrangeIcons() {
    const desktop = document.getElementById('desktop');
    const icons = desktop.querySelectorAll('.icon');
    const iconSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--icon-size'));
    const xSpacing = iconSize + 10;
    const ySpacing = iconSize + 20;
    
    let x = 20, y = 20;
    
    icons.forEach(icon => {
        if (y + ySpacing > desktop.offsetHeight) {
            y = 20;
            x += xSpacing;
        }
        icon.style.left = x + 'px';
        icon.style.top = y + 'px';
        appPositions[icon.dataset.appName] = { x: x, y: y };
        y += ySpacing;
    });
    
    localStorage.setItem('luminal_positions', JSON.stringify(appPositions));
}

function resetIconPositions() {
    localStorage.removeItem('luminal_positions');
    appPositions = {};
    renderDesktopIcons();
}

function openThemeBuilder(options) {
    const themeSettings = [
        { name: 'Accent Color', var: '--accent-color', type: 'color' },
        { name: 'Window Background', var: '--window-bg', type: 'color' },
        { name: 'Window Border', var: '--window-border', type: 'color' },
        { name: 'Header Background', var: '--header-bg', type: 'color' },
        { name: 'Text Color', var: '--text-color', type: 'color' },
        { name: 'Start Menu BG', var: '--start-menu-bg', type: 'color' },
        { name: 'Input Background', var: '--input-bg', type: 'color' },
        { name: 'Input Border', var: '--input-border', type: 'color' }
    ];
    
    let themeHTML = `<div style="padding: 20px; color: var(--text-color); height: 100%; overflow-y: auto;"><h3><i class="fa-solid fa-brush"></i> Theme Builder</h3><p>Customize the look and feel of luminalOS. Changes are saved automatically.</p><hr style="border-color: var(--window-border);">`;
    
    themeSettings.forEach(setting => {
        const savedValue = localStorage.getItem(`luminal_theme_custom_${setting.var}`) || getComputedStyle(document.documentElement).getPropertyValue(setting.var).trim();
        themeHTML += `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                <label for="theme-${setting.var}">${setting.name}</label>
                <input type="${setting.type}" id="theme-${setting.var}" value="${savedValue}" 
                       oninput="updateTheme('${setting.var}', this.value)">
            </div>
        `;
    });
    
    themeHTML += `<hr style="border-color: var(--window-border);"><button class="os-button" onclick="resetThemeDefaults()">Reset to Defaults</button></div>`;
    
    options.html = themeHTML;
    options.width = 400;
    options.height = 550;
    createWindow(options);
}

window.updateTheme = (cssVar, value) => {
    document.documentElement.style.setProperty(cssVar, value);
    localStorage.setItem(`luminal_theme_custom_${cssVar}`, value);
};

window.resetThemeDefaults = () => {
    const themeVars = ['--accent-color', '--window-bg', '--window-border', '--header-bg', '--text-color', '--start-menu-bg', '--input-bg', '--input-border'];
    themeVars.forEach(v => localStorage.removeItem(`luminal_theme_custom_${v}`));
    location.reload();
};

function loadCustomTheme() {
    const themeVars = ['--accent-color', '--window-bg', '--window-border', '--header-bg', '--text-color', '--start-menu-bg', '--input-bg', '--input-border'];
    themeVars.forEach(v => {
        const savedValue = localStorage.getItem(`luminal_theme_custom_${v}`);
        if (savedValue) {
            document.documentElement.style.setProperty(v, savedValue);
        }
    });
}

function saveWallpaper() {
    const url = document.getElementById('wallpaper-url-input').value;
    if (url) {
        document.body.style.backgroundImage = `url('${url}')`;
        localStorage.setItem('luminal_wallpaper', url);
    }
}

function setWallpaperFromFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            document.body.style.backgroundImage = `url('${dataUrl}')`;
            localStorage.setItem('luminal_wallpaper', dataUrl);
        }
        reader.readAsDataURL(file);
    }
}

function openCloakedWindow(type) {
    const cloakOptions = {
        new_tab: { title: "New Tab", favicon: "newtab.png", redirectUrl: "https://classroom.google.com" },
        google_classroom: { title: "Home", favicon: "https://www.gstatic.com/classroom/ic_product_classroom_144.png", redirectUrl: "https://www.google.com" },
        clever: { title: "Clever | Portal", favicon: "https://www.clever.com/wp-content/uploads/2023/06/cropped-Favicon-512px-192x192.png", redirectUrl: "https://www.google.com" }
    };
    
    const config = cloakOptions[type] || cloakOptions.new_tab;
    const win = window.open();
    
    if (!win) {
        alert("Popup blocked! Please allow popups for this site to use this feature.");
        return;
    }
    
    win.document.open();
    win.document.write(`
        <html>
            <head>
                <title>${config.title}</title>
                <link rel="icon" type="image/x-icon" href="${config.favicon}">
                <style>
                    * { margin: 0; padding: 0; border: none; }
                    body, html { height: 100vh; width: 100vw; overflow: hidden; }
                    iframe { width: 100%; height: 100%; }
                    #reload-btn {
                        position: fixed; top: 10px; left: 10px; z-index: 9999;
                        width: 32px; height: 32px; border: none; border-radius: 50%;
                        background: rgba(0,0,0,0.3) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' height='20' viewBox='0 -960 960 960' width='20'%3E%3Cpath d='M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z'/%3E%3C/svg%3E") center no-repeat;
                        cursor: pointer; opacity: 0.5; transition: opacity 0.2s;
                    }
                    #reload-btn:hover { opacity: 1; }
                </style>
            </head>
            <body>
                <button id="reload-btn" title="Reload"></button>
                <iframe id="luminalos" src="${location.origin}"></iframe>
                <script>
                    document.getElementById("reload-btn").addEventListener("click", () => {
                        document.getElementById("luminalos").contentWindow.location.reload();
                    });
                <\/script>
            </body>
        </html>
    `);
    win.document.close();
    
    location.href = config.redirectUrl;
}

function openPythonExecutor(options) {
    options.width = 700;
    options.height = 500;
    options.html = `
        <div style="height: 100%; display: flex; flex-direction: column; background: #1e1e1e; color: #d4d4d4; font-family: 'Fira Code', monospace;">
            <div style="height: 60%; border-bottom: 1px solid #3e3e42;">
                <div style="background: #252526; padding: 10px; border-bottom: 1px solid #3e3e42; display: flex; align-items: center; gap: 10px;">
                    <span style="color: #4a90e2; font-weight: bold;">Python Executor</span>
                    <button class="os-button" onclick="runPython()" id="python-run-btn"><i class="fa-solid fa-play"></i> Run (Ctrl+Enter)</button>
                    <button class="os-button" onclick="clearPythonEditor()"><i class="fa-solid fa-trash"></i> Clear</button>
                    <button class="os-button" onclick="loadPythonExample()"><i class="fa-solid fa-lightbulb"></i> Example</button>
                    <div id="python-status" style="margin-left: auto; font-size: 12px; color: #888;"></div>
                </div>
                <textarea id="python-editor" style="width: 100%; height: calc(100% - 50px); background: #1e1e1e; color: #d4d4d4; border: none; padding: 15px; font-family: 'Fira Code', monospace; font-size: 14px; resize: none; line-height: 1.5;" placeholder="# Real Python execution with Pyodide
# Full standard library available!
print('Hello from Python!')
# Try these examples:
# import math
# print(f'Pi = {math.pi:.4f}')
# import json
# data = {'name': 'Python', 'version': '3.x'}
# print(json.dumps(data, indent=2))
# for i in range(5):
#     print(f'Count: {i}')"></textarea>
            </div>
            <div style="height: 40%; background: #0c0c0c; display: flex; flex-direction: column;">
                <div style="background: #252526; padding: 10px; border-bottom: 1px solid #3e3e42; display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #4a90e2;">Python Output</span>
                    <button class="os-button" onclick="clearPythonOutput()" style="padding: 5px 10px; font-size: 12px;"><i class="fa-solid fa-eraser"></i></button>
                </div>
                <div id="python-output" style="flex: 1; padding: 15px; font-size: 13px; overflow-y: auto; white-space: pre-wrap; font-family: 'Fira Code', monospace;">Loading Python environment...</div>
            </div>
        </div>`;
    
    createWindow(options);
    
    setTimeout(() => {
        initpyodide();
        const editor = document.getElementById('python-editor');
        editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                runPython();
            }
        });
    }, 100);
}

window.pyodide = null;

async function initpyodide() {
    const statusEl = document.getElementById('python-status');
    const outputEl = document.getElementById('python-output');
    
    try {
        statusEl.textContent = 'Loading Python...';
        outputEl.textContent = 'Loading Pyodide (Python in WebAssembly)...\nThis may take a moment on first load.';
        
        if (!window.loadPyodide) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
            document.head.appendChild(script);
            await new Promise((resolve) => {
                script.onload = resolve;
            });
        }
        
        window.pyodide = await loadPyodide();
        
        window.pyodide.runPython(`
import sys
from io import StringIO

class JSConsole:
    def __init__(self):
        self.output = []
    
    def write(self, text):
        if text.strip():
            self.output.append(text.rstrip())
    
    def flush(self):
        pass
    
    def get_output(self):
        result = '\\n'.join(self.output)
        self.output = []
        return result

js_console = JSConsole()
sys.stdout = js_console
sys.stderr = js_console
        `);
        
        statusEl.textContent = 'Python Ready';
        outputEl.textContent = 'Python environment loaded successfully!\nYou can now run full Python code with the standard library.';
    } catch (error) {
        statusEl.textContent = 'Python Error';
        outputEl.textContent = `Failed to load Python environment: ${error.message}`;
    }
}

window.runPython = async () => {
    if (!window.pyodide) {
        document.getElementById('python-output').textContent = 'Python environment not loaded yet. Please wait...';
        return;
    }
    
    const code = document.getElementById('python-editor').value;
    const output = document.getElementById('python-output');
    
    try {
        window.pyodide.runPython('js_console.output = []');
        const result = window.pyodide.runPython(code);
        const capturedOutput = window.pyodide.runPython('js_console.get_output()');
        
        let finalOutput = '';
        
        if (capturedOutput) {
            finalOutput += capturedOutput;
        }
        
        if (result !== undefined && result !== null && String(result) !== 'None') {
            if (finalOutput) finalOutput += '\n';
            finalOutput += `↩️ ${result}`;
        }
        
        output.textContent = finalOutput || 'Code executed successfully (no output)';
    } catch (error) {
        output.textContent = `Error: ${error.message}`;
    }
};

window.clearPythonEditor = () => {
    document.getElementById('python-editor').value = '';
    document.getElementById('python-output').textContent = 'Python environment ready.';
};

window.clearPythonOutput = () => {
    document.getElementById('python-output').textContent = 'Python environment ready.';
};

function openBrowser(options) { 
    options.url = 'calculus.html'; 
    createWindow(options); 
}

function openMinecraft() {
    window.open('/math/index.html', '_blank');
}

function renderDesktopIcons() { 
    const desktop = document.getElementById('desktop'); 
    desktop.innerHTML = ''; 
    
    let x = 20, y = 20; 
    const iconSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--icon-size'));
    const xSpacing = iconSize + 10;
    const ySpacing = iconSize + 20;
    
    apps.filter(app => app.pinned).forEach(app => {
        const icon = document.createElement('div'); 
        icon.className = 'icon'; 
        icon.dataset.appName = app.name;
        
        const pos = appPositions[app.name];
        if (pos) { 
            icon.style.left = pos.x + 'px'; 
            icon.style.top = pos.y + 'px'; 
        } else { 
            if (y + ySpacing > desktop.offsetHeight) {
                y = 20;
                x += xSpacing;
            }
            icon.style.left = x + 'px'; 
            icon.style.top = y + 'px'; 
            y += ySpacing;
        }
        
        icon.innerHTML = `
            ${app.icon.endsWith(".png") || app.icon.endsWith(".jpg") || app.icon.endsWith(".svg")
                ? `<img src="${app.icon}" class="app-icon-img">`
                : `<i class="${app.icon}"></i>`}
            <span>${app.name}</span>`;
        
        icon.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                e.preventDefault(); 
                launchApp(app.name);
            }
            lastTap = currentTime;
        });
        
        icon.addEventListener('dblclick', () => launchApp(app.name));
        icon.addEventListener('contextmenu', (e) => showContextMenu(e, {type: 'desktop-icon', appName: app.name}));
        
        makeIconDraggable(icon, app.name); 
        desktop.appendChild(icon);
    });
}

function makeIconDraggable(icon, appName) {
    const startDrag = (e) => {
        if (e.button && e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        
        icon.classList.add('is-dragging');
        
        const coords = getEventCoords(e);
        let pos3 = coords.x;
        let pos4 = coords.y;
        
        const doDrag = (e) => {
            e.preventDefault();
            const currentCoords = getEventCoords(e);
            let pos1 = pos3 - currentCoords.x;
            let pos2 = pos4 - currentCoords.y;
            pos3 = currentCoords.x;
            pos4 = currentCoords.y;
            
            icon.style.top = (icon.offsetTop - pos2) + "px";
            icon.style.left = (icon.offsetLeft - pos1) + "px";
        };
        
        const stopDrag = () => {
            icon.classList.remove('is-dragging');
            removeMoveListeners(doDrag, stopDrag);
            appPositions[appName] = { x: icon.offsetLeft, y: icon.offsetTop };
            localStorage.setItem('luminal_positions', JSON.stringify(appPositions));
        };
        
        addMoveListeners(doDrag, stopDrag);
    };
    
    icon.addEventListener('mousedown', startDrag);
    icon.addEventListener('touchstart', startDrag, { passive: false });
}

function renderAppList() { 
    const appList = document.getElementById('app-list'); 
    appList.innerHTML = ''; 
    
    apps.forEach(app => { 
        const item = document.createElement('div'); 
        item.className = 'app-list-item'; 
        const isImageIcon = app.icon.endsWith(".png") || app.icon.endsWith(".jpg") || app.icon.endsWith(".svg");
        item.innerHTML = `${isImageIcon ? `<img src="${app.icon}" style="width: 24px; height: 24px;">` : `<i class="${app.icon}"></i>`}<span>${app.name}</span>`;
        item.addEventListener('click', () => {launchApp(app.name); toggleStartMenu(false);}); 
        item.addEventListener('contextmenu', (e) => showContextMenu(e, {type: 'start-menu-app', appName: app.name})); 
        appList.appendChild(item); 
    }); 
}

function toggleStartMenu(show) {
    const startMenu = document.getElementById('start-menu');
    const searchBox = document.getElementById('search-box');
    if (!startMenu || !searchBox) return;
    
    if (show === undefined) {
        show = startMenu.style.display === 'none' || startMenu.style.display === '';
    }
    
    startMenu.style.display = show ? 'flex' : 'none';
    
    if (show) {
        searchBox.value = "";
        searchBox.focus();
        filterG3mes("");
    }
}

function setupSearch() {
    const searchBox = document.getElementById('search-box');
    if (!searchBox) return;
    
    searchBox.addEventListener('input', () => {
        filterG3mes(searchBox.value.toLowerCase());
    });
}

function filterG3mes(query) {
    const appList = document.getElementById('app-list');
    if (!appList) {
        console.warn('app-list element not found');
        return;
    }
    
    const allMenuItems = appList.children;
    
    Array.from(allMenuItems).forEach((item) => {
        const itemText = item.textContent.trim().toLowerCase();
        if (query === '' || itemText.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function updateClock() { 
    const clock = document.getElementById('clock'); 
    const format = localStorage.getItem('luminal_clock_format') || '12'; 
    if (clock) {
        clock.textContent = new Date().toLocaleTimeString([], {
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: format === '12'
        }); 
    }
}

function cloakTab(type = 'google') { 
    document.title = "Home"; 
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link'); 
    link.rel = 'icon'; 
    link.href = 'https://ssl.gstatic.com/classroom/favicon.png'; 
    document.head.appendChild(link); 
}

function saveApps() { 
    if (typeof apps !== 'undefined') {
        localStorage.setItem('luminal_apps', JSON.stringify(apps)); 
    }
}

function syncApps() {
    let savedApps = JSON.parse(localStorage.getItem('luminal_apps')) || [];
    let masterApps = JSON.parse(JSON.stringify(masterAppConfig));
    
    let finalApps = [];
    let seen = new Set();
    
    [...savedApps, ...masterApps].forEach(app => {
        if (!seen.has(app.name)) {
            seen.add(app.name);
            const savedApp = savedApps.find(a => a.name === app.name);
            const masterApp = masterApps.find(a => a.name === app.name);
            
            if (masterApp && savedApp) {
                finalApps.push({...masterApp, ...savedApp});
            } else if (masterApp) {
                finalApps.push(masterApp);
            } else if (savedApp && savedApp.isCustom) {
                finalApps.push(savedApp);
            }
        }
    });
    
    apps = finalApps;
    saveApps();
}

function showStartupPrompt() {
    if (localStorage.getItem('luminal_startup_complete')) {
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'startup-modal-overlay';
    
    const showSecondPrompt = () => {
        overlay.innerHTML = `
            <div class="startup-modal">
                <h2>Choose a Cloak Preset</h2>
                <p>Select how you want the tab to appear when automatically cloaked. This requires popup permissions to work correctly.</p>
                <div class="button-group">
                    <button class="os-button" data-preset="new_tab">New Tab</button>
                    <button class="os-button" data-preset="google_classroom">Google Classroom</button>
                    <button class="os-button" data-preset="clever">Clever</button>
                </div>
            </div>`;
        
        overlay.querySelectorAll('.os-button').forEach(button => {
            button.addEventListener('click', () => {
                localStorage.setItem('luminal_auto_cloak', 'true');
                localStorage.setItem('luminal_auto_cloak_preset', button.dataset.preset);
                localStorage.setItem('luminal_startup_complete', 'true');
                overlay.remove();
                alert("Settings saved! The auto-cloak will apply the next time you open luminalOS. Please ensure you've allowed popups for this site.");
            });
        });
    };
    
    overlay.innerHTML = `
        <div class="startup-modal">
            <h2>Welcome to luminalOS!</h2>
            <p>LuminalOS is your go-to site for a great unbl0cked g@mes experience! we have a blazing fast unbl0cker, an amazing discord server with all the links you could need, and a ton of gammes. Have fun!<br>when you visit the site, the first click will be an ad, dont worry, just close it and you wont have to deal with it again until a new session!<br>tip: if you're on chromebook, zoom out to 80% using ctrl + - for a better experience!</p>
            <p>Would you like to automatically open luminalOS in a cloaked about:blank window? This can help bypass certain web filters like GoGuardian, and no teachers can see your screen. IF your filter closes about:blank tabs, quickly reset luminalOS before it closes in settings. I am working on some new methods for this.</p>
            <div class="button-group">
                <button class="os-button" id="startup-yes">enable auto-cloak</button>
                <button class="os-button" id="startup-no" style="background-color:#555;">No, thanks</button>
            </div>
        </div>`;
    
    document.body.appendChild(overlay);
    
    document.getElementById('startup-yes').addEventListener('click', showSecondPrompt);
    document.getElementById('startup-no').addEventListener('click', () => {
        localStorage.setItem('luminal_auto_cloak', 'false');
        localStorage.setItem('luminal_startup_complete', 'true');
        overlay.remove();
    });
}

window.resetLuminalOS = function() {
    if (confirm('Are you sure you want to reset luminalOS? This will clear all settings, apps, and files.')) {
        localStorage.clear();
        location.reload();
    }
};

async function checkForAdminAnnouncement() {
    try {
        const response = await fetch('/api/admin/announcement');
        if (!response.ok) return;

        const announcement = await response.json();
        if (announcement.message && sessionStorage.getItem('luminal_announcement_seen') !== 'true') {
            showAdminAnnouncement(announcement.message);
            sessionStorage.setItem('luminal_announcement_seen', 'true');
        }
    } catch (error) {
        console.warn('Could not fetch admin announcement:', error);
    }
}

function showAdminAnnouncement(message) {
    const banner = document.createElement('div');
    banner.id = 'admin-announcement';
    banner.innerHTML = `
        <i class="fa-solid fa-flag"></i>
        <p>${message}</p>
        <button>&times;</button>
    `;
    document.body.appendChild(banner);

    const closeButton = banner.querySelector('button');
    const closeBanner = () => {
        banner.classList.add('hide');
        setTimeout(() => banner.remove(), 500);
    };

    closeButton.addEventListener('click', closeBanner);
    setTimeout(closeBanner, 10000);
}

function init() {
    window.systemStartTime = Date.now();
    showStartupPrompt();
    checkForAdminAnnouncement();
    arrangeIcons();
    
    const savedTheme = localStorage.getItem('luminal_theme');
    if (savedTheme) document.body.className = `theme-${savedTheme}`;
    
    loadCustomTheme();
    initFileSystem(); 
    syncApps();
    
    appPositions = JSON.parse(localStorage.getItem('luminal_positions')) || {};
    
    const accent = localStorage.getItem('luminal_accent') || '#4a90e2'; 
    const blur = localStorage.getItem('luminal_blur') || '20'; 
    const wallpaper = localStorage.getItem('luminal_wallpaper') || 'https://cdn.jsdelivr.net/gh/sealiee11/randomluminalshii@main/background.jpg';
    const iconSize = localStorage.getItem('luminal_iconSize') || 90;
    
    document.documentElement.style.setProperty('--accent-color', accent); 
    document.documentElement.style.setProperty('--taskbar-blur', blur + 'px');
    document.documentElement.style.setProperty('--icon-size', iconSize + 'px');
    document.body.style.backgroundImage = `url('${wallpaper}')`;
    
    renderDesktopIcons(); 
    renderAppList(); 
    updateTaskbar(); 
    updateClock(); 
    setInterval(updateClock, 1000);  
    
    document.getElementById('start-button').addEventListener('click', (e) => { e.stopPropagation(); toggleStartMenu(); });
    document.getElementById('panic-button').addEventListener('click', () => cloakTab());
    document.getElementById('show-desktop-btn').addEventListener('click', showDesktop);
    
    document.addEventListener('click', (e) => {
        const startMenu = document.getElementById('start-menu');
        if (startMenu && !startMenu.contains(e.target) && e.target.id !== 'start-button' && !e.target.closest('#start-button')) {
             toggleStartMenu(false);
        }
        hideContextMenu();
    });
    
    document.getElementById('desktop').addEventListener('contextmenu', (e) => showContextMenu(e, {type: 'desktop'}));
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideContextMenu();
            toggleStartMenu(false);
        }
    });
    
    window.addEventListener('message', (event) => { 
        if(event.data.type === 'addG3meToDesktop') addG3meToDesktop(event.data.g3meData); 
    });
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cloakPage();
        } else {
            uncloakPage();
        }
    });
    
    const taskbar = document.getElementById('taskbar');
    
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            taskbar.classList.add('taskbar-hidden');
        } else {
            taskbar.classList.remove('taskbar-hidden', 'taskbar-peek');
             Object.values(openWindows).forEach(win => {
                if (win.fullscreen) {
                    const taskbarHeight = document.getElementById('taskbar').offsetHeight + 8;
                    win.element.style.height = `calc(100vh - ${taskbarHeight}px)`;
                }
            });
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        if (document.fullscreenElement) {
            const peekThreshold = 20;
            if (e.clientY > window.innerHeight - peekThreshold) {
                taskbar.classList.add('taskbar-peek');
            } else {
                taskbar.classList.remove('taskbar-peek');
            }
        }
    });

    
    function showDesktop() {
        Object.keys(openWindows).forEach(windowId => {
            const windowData = openWindows[windowId];
            if (windowData && !windowData.minimized) {
                minimizeWindow(windowId);
            }
        });
    }
    
    setupSearch();
    
}

document.addEventListener('DOMContentLoaded', init);