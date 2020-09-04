// ==UserScript==
// @name         EHNav
// @namespace    https://e-hentai.org/
// @version      0.0.1
// @description  keyboard navigation for E-Hentai
// @author       You
// @match        https://e-hentai.org/*
// @match        https://exhentai.org/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    const isEx = /\/\/ex/.test(window.location.href);

    GM_setValue((isEx ? 'x' : '') + 'theme', 'ex');
    const theme = GM_getValue((isEx ? 'x' : '') + 'theme') || 'eh';
    // document.body.classList.add('theme-' + theme);
    document.body.classList.add('theme-' + (isEx ? 'ex' : 'eh'));

    const cssPatch = document.createElement('style');
    cssPatch.innerHTML = `\
body.theme-eh {
  --foreground: #5C0D11;
  --background: #E3E0D1;
  --background-alt: #EDEBDF;
  --background-alt2: #EDEADA;
  --background-tag: #F2EFDF;
  --background-header: #E0DED3;
  --background-pager: #E3E0D1;
  --background-comment: var(--background-pager);
  --border: #5C0D12;
  --border-input: #B5A4A4;
  --border-button: #B5A4A4;
  --border-tag: #9A7C7E;
  --border-comment:  var(--background-tag);
  --background-row: var(--background-alt);
  --background-row2: #F2F0E4;
  --foreground-link: #5C0D11;
  --foreground-link-visited: #8F6063;
  --foreground-subtitle: #9F8687;
  --border-radius: 9px;
  --image-filter: none;
}

body.theme-ex {
  --foreground: #F1F1F1;
  --background: #34353B;
  --background-alt: #4F535B;
  --background-alt2: #34353B;
  --background-tag: var(--background-alt);
  --background-header: #40454B;
  --background-pager: var(--background-alt2);
  --background-comment: var(--background-pager);
  --border: #000000;
  --border-input: #8D8D8D;
  --border-button: #8D8D8D;
  --border-tag: #989898;
  --border-comment: var(--background-tag);
  --background-row: #3C414B;
  --background-row2: #363940;
  --foreground-link: #DDDDDD;
  --foreground-link-visited: #BBBBBB;
  --foreground-subtitle: #B8B8B8;
  --border-radius: 0;
  --image-filter: grayscale(1) brightness(8);
}

body, div.gm, a,
input, select, option, optgroup, textarea,
.glname a :not(.glink), a .glname :not(.glink) {
  color: var(--foreground);
}

table.itg>tbody>tr>th {
  background-color: var(--background-header);
}

table.ptt td {
  background-color: var(--background-pager);
}

div.c2 {
  background-color: var(--background-comment);
  border-color: var(--border-comment);
}

a .glink {
  color: var(--foreground-link);
}

a:visited .glink, a:active .glink {
  color: var(--foreground-link-visited);
}

h1#gj {
  color: var(--foreground-subtitle);
}

div.gm, div.ido, div#gdt {
  border-color: var(--border);
  border-radius: var(--border-radius);
  background-color: var(--background-alt);
}

div.idi, table.ptt td, table.itg, h1#gj, div#gd4, div#gdt img {
  border-color: var(--border);
}

div.gt, div.gta, div.gtl {
  border-color: var(--border-tag);
  background: var(--background-tag);
}

div#gleft, div#gd2, div#gmid {
  background-color: var(--background-alt);
}

body {
  background-color: var(--background);
}

input, select, option, optgroup, textarea {
  background-color: var(--background-alt2);
}

input[type="text"], input[type="password"], select, textarea {
  border-color: var(--border-input);
}

input[type="button"], input[type="submit"] {
  border-color: var(--border-button);
}

table.itg>tbody>tr:nth-child(2n), table.itg>tbody>tr:nth-child(2n) .glthumb, table.itg>tbody>tr:nth-child(2n) .glcut {
  background-color: var(--background-row);
}

table.itg>tbody>tr:nth-child(2n+1), table.itg>tbody>tr:nth-child(2n+1) .glthumb, table.itg>tbody>tr:nth-child(2n+1) .glcut {
  background-color: var(--background-row2);
}

img.ygm {
  filter: var(--image-filter);
}`;

    if (isEx) {
        for (const comment of document.getElementsByClassName('c3')) {
            const link = document.createElement('span'),
              mail = document.createElement('img');
            // link.href = 'https://forums.e-hentai.org/index.php?showuser='; // TODO: get user id
            mail.src = 'https://ehgt.org/g/ygm.png';
            mail.alt = 'PM';
            mail.title = 'Contact Poster';
            mail.classList.add('ygm');
            link.appendChild(mail);
            comment.appendChild(document.createTextNode('\xa0 \xa0 '));
            comment.appendChild(link);
        }
    }

    document.body.appendChild(cssPatch);

    let active = false,
        tagNav = false,
        spotlightActive = false;

    let actions, tagPos = [];
    function handleKey(e) {
        if (e.key === 'Escape') {
            active = !active;
            if (active) {
                showLabels();
            } else {
                hideLabels();
            }
            return;
        }
        if (e.key === ' ' && e.ctrlKey && e.altKey) { e.preventDefault(); e.stopPropagation(); toggleSpotlight(); }
        if (!active) { return; }
        if (tagNav) { return handleTagKey(e); }
        if (e.key in actions && !e.ctrlKey && !e.altKey) {
            actions[e.key]();
        }
    }

    function handleTagKey(e) {
        switch (e.which) {
        }
    }

    const spotlight = document.createElement('div');
    spotlight.innerHTML = `\
<div style="position:fixed; top: 45vh; height: 4em; font-size: 2em; left: calc(50vw - 200px); width: 400px; display: none">
</div>`;

    function toggleSpotlight() {
        if (spotlightActive) {
            spotlight.style.display = 'none';
        } else {
            spotlight.style.display = null;
        }
        spotlightActive = !spotlightActive;
    }

    document.body.addEventListener('keydown', handleKey);

    const navbar = document.getElementById('nb');
    const tags = document.getElementById('taglist');
    const galleryEdit = document.getElementById('gd5');
    let labels = window.labels = !isEx ? [
        { name: 'Front Page', key: 'm', element: navbar.children[0] },
        { name: 'Watched', key: 'w', element: navbar.children[1] },
        { name: 'Popular', key: 'p', element: navbar.children[2] },
        { name: 'Torrents', key: 'T', element: navbar.children[3] },
        { name: 'Favorites', key: 'f', element: navbar.children[4] },
        { name: 'My Home', key: 'h', element: navbar.children[5] },
        { name: 'My Uploads', key: 'u', element: navbar.children[6] },
        { name: 'Toplists', key: 'l', element: navbar.children[7] },
        { name: 'Bounties', key: 'b', element: navbar.children[8] },
        { name: 'News', key: 'n', element: navbar.children[9] },
        { name: 'Forums', key: 'f', element: navbar.children[10] },
        { name: 'Wiki', key: 'W', element: navbar.children[11] },
        { name: 'HentaiVerse', key: 'v', element: navbar.children[12] },
        { name: 'Report Gallery', key: 'R', element: galleryEdit.children[0], top: '1em', left: '0' },
        { name: 'Archive Download', key: 'd', element: galleryEdit.children[1], top: '1em', left: '0' },
        { name: 'Torrent Download', key: 'D', element: galleryEdit.children[2], left: '0' },
        { name: 'Petition to Expunge', key: 'e', element: galleryEdit.children[3], top: '1.25em', left: '0' },
        { name: 'Petition to Rename', key: 'r', element: galleryEdit.children[4], left: '0' },
        { name: 'Show Gallery Stats', key: 'S', element: galleryEdit.children[5], left: '0' },
        { name: 'Tags', key: 't', element: tags, action: () => {
            tagNav = !tagNav;
            hideLabels();
        } },
    ] : [];
    // TODO: albert style launcher
    // TODO: load config from localstorage
    // TODO: import/export config

    function updateLabels() {
        for (const label of document.getElementsByClassName('ehp-label')) {
            label.parent.removeChild(label);
        }
        actions = {};
        for (const label of labels) {
            actions[label.key] = label.action || (element => () => { element.click(); })(label.element.querySelector('a'));
            if (label.element) {
                label.element.style.position = 'relative';
            }
            const el = document.createElement('div');
            el.style.position = 'absolute';
            el.style.border = '1px solid var(--foreground)';
            el.style.borderRadius = '2px';
            el.style.top = '1px';
            el.style.left = '-10px';
            el.style.width = '1em';
            el.style.lineHeight = '1em';
            el.style.backgroundColor = 'var(--background)';
            el.style.color = 'var(--foreground)';
            el.style.textAlign = 'center';
            el.style.fontWeight = 'bold';
            el.style.display = 'none';
            el.classList.add('ehp-label');
            if (label.action) {
                el.style.top = 'calc(50% - 0.5em)';
                el.style.left = 'calc(50% - 0.5em)';
            }
            if (label.top) { el.style.top = label.top; }
            if (label.left) { el.style.left = label.left; }
            el.innerText = label.key;
            label.element.appendChild(el);
        }
    }

    function hideLabels() {
        for (const label of document.getElementsByClassName('ehp-label')) {
            label.style.display = 'none';
        }
    }

    function showLabels() {
        for (const label of document.getElementsByClassName('ehp-label')) {
            label.style.display = null;
        }
    }

    function addLabel() {
    }

    function removeLabel(name) {
        labels = labels.filter(label => label.name !== name);
    }

    updateLabels();
})();
