// ==UserScript==
// @name         EHNav
// @namespace    https://e-hentai.org/
// @version      0.0.2
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
  --active-tag: blue;
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
  --active-tag: blue;
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
        tagNavState,
        spotlightActive = false;

    const activeTags = new Set();

    function ontagclick(e) {
        e.preventDefault();
        e.stopPropagation();
        const currentTag = e.target.id.slice(3);
        if (activeTags.has(currentTag)) {
            activeTags.delete(currentTag);
        } else {
            activeTags.add(currentTag);
        }

        if (activeTags.size === 1) {
            const tag = activeTags.values().next().value;
            /* global _refresh_tagmenu_act */
            document.getElementById('tagmenu_new').style.display = 'none';
            document.getElementById('tagmenu_act').style.display = null;
            _refresh_tagmenu_act(tag, document.getElementById('ta_' + tag));
            updateLabels();
            if (tagNav) { showTagLabels(); } else { showLabels(); }
        } else if (activeTags.size === 0) {
            document.getElementById('tagmenu_new').style.display = null;
            document.getElementById('tagmenu_act').style.display = 'none';
        }

        if (activeTags.has(currentTag)) {
            e.target.style.color = 'var(--active-tag)';
        } else {
            e.target.style.color = null;
        }
    }

    function hookTags() {
        const tags = document.querySelectorAll('#taglist a');
        for (const tag of tags) {
            tag.addEventListener('click', ontagclick);
            tag.removeAttribute('onclick');
        }
    }
    hookTags();

    function tag_show_galleries() {
        document.location.href = 'https://e-hentai.org/?f_search=' + [...activeTags].map(tag => tag.replace(/:(.+)$/, ':"$1$$"')).join(' ').replace(/\s+/g, '+');
    }
    unsafeWindow.tag_show_galleries = tag_show_galleries;

    /* globals token apiuid apikey gid wait_roller_set tag_update_vote tag_xhr:writable api_call api_response */
    function send_vote2(b,a){
        const sents = Array(b.length).fill(false);
        wait_roller_set();
        for (let i = 0; i < b.length; i++) {
            const xhr = new XMLHttpRequest(),
                c = {method:"taggallery",apiuid:apiuid,apikey:apikey,gid:gid,token:token,tags:b[i],vote:a};
            /* eslint-disable no-loop-func */
            ((i, xhr) => {
                api_call(xhr, c, () => {
                    sents[i] = true;
                    if (sents.every(_=>_)) { tag_xhr = xhr; tag_update_vote(); hookTags(); updateLabels(); }
                });
            })(i, xhr);
            /* eslint-enable no-loop-func */
        }
    }
    unsafeWindow.send_vote2 = send_vote2;

    function tag_vote_up() {
        send_vote2([...activeTags], 1); activeTags.clear();
    }
    unsafeWindow.tag_vote_up = tag_vote_up;

    function tag_vote_down() {
        send_vote2([...activeTags], -1); activeTags.clear();
    }
    unsafeWindow.tag_vote_down = tag_vote_down;

    let actions, tagActions, tagPos = [];
    function handleKey(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            const selection = window.getSelection().toString();
            if (selection) {
                document.location.href = 'https://e-hentai.org/?f_search=' + selection.replace(/\s+/g, '+');
                return;
            }
            const tagMenu = document.getElementById('tagmenu_act');
            if (tagMenu.style.display !== null) {
                /* global tag_show_galleries */
                tag_show_galleries();
                return;
            }
        }
        if (e.key === 'Escape') {
            active = !active;
            if (active) {
                showLabels();
            } else {
                hideLabels();
                hideTagLabels();
            }
            return;
        }
        if (e.key === ' ' && e.ctrlKey && e.altKey) { e.preventDefault(); e.stopPropagation(); toggleSpotlight(); }
        if (!active) { return; }
        if (tagNav) {
            if (e.key === 'Enter') {
                ontagclick({preventDefault: ()=>{}, stopPropagation: ()=>{}, target: tagArray[tagNavState.y][Math.min(tagArray[tagNavState.y].length - 1, tagNavState.x)].children[0] });
            }
            if (e.key in tagActions && !e.ctrlKey && !e.altKey) {
                tagActions[e.key]();
            }
        } else if (e.key in actions && !e.ctrlKey && !e.altKey) {
            actions[e.key]();
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

    function addTagBorder() {
        tagArray[tagNavState.y][Math.min(tagArray[tagNavState.y].length - 1, tagNavState.x)].style.borderWidth = '2px';
    }

    function removeTagBorder() {
        tagArray[tagNavState.y][Math.min(tagArray[tagNavState.y].length - 1, tagNavState.x)].style.borderWidth = null;
    }

    document.body.addEventListener('keydown', handleKey);

    const navbar = document.getElementById('nb');
    const tags = document.getElementById('taglist') || document.createElement('div');
    const tagMenu = document.getElementById('tagmenu_act') || document.createElement('div');
    const tagArray = tags.id === 'taglist' ? [...tags.children[0].children[0].children].map(row => row.children[1].children) : [[]];
    const galleryEdit = document.getElementById('gd5') || {children:Array(6).fill(document.createElement('div'))};
    let labels = unsafeWindow.labels = !isEx ? [
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
            if (tagNav) {
                tagNavState = {x:0, y:0};
                addTagBorder();
            } else {
                removeTagBorder();
            }
            hideLabels();
            showTagLabels();
        } },
    ] : [ /* TODO */ ];
    let tagLabels = unsafeWindow.tagLabels = [
        { name: 'Up', key: 'w', element: tags, left: '500px', top: '234px', action: () => {
            if (tagNavState.y > 0) {
                removeTagBorder();
                tagNavState.y--;
                addTagBorder();
            }
        } },
        { name: 'Left', key: 'a', element: tags, left: '484px', top: '250px', action: () => {
            if (tagNavState.x > 0) {
                removeTagBorder();
                tagNavState.x--;
                addTagBorder();
            }
        } },
        { name: 'Down', key: 's', element: tags, left: '500px', top: '250px', action: () => {
            if (tagNavState.y < tagArray.length - 1) {
                removeTagBorder();
                tagNavState.y++;
                addTagBorder();
            }
        } },
        { name: 'Right', key: 'd', element: tags, left: '516px', top: '250px', action: () => {
            if (tagNavState.x !== tagArray[tagNavState.y].length - 1) {
                removeTagBorder();
                tagNavState.x = Math.min(tagNavState.x + 1, tagArray[tagNavState.y].length - 1);
                addTagBorder();
            }
        } },
        { name: 'Vote Up', key: 'r', element: () => tagMenu.children[1], top: '-0.1em', left: '-1.3em' },
        { name: 'Vote Down', key: 'f', element: () => tagMenu.children[3], top: '-0.1em', left: '-1.3em' },
        { name: 'Show Tagged Galleries', key: 'q', element: () => tagMenu.children[5], top: '-0.1em', left: '-1.3em' },
        { name: 'Show Tag Definition', key: 'e', element: () => tagMenu.children[7], top: '-0.1em', left: '-1.3em' },
        { name: 'Add New Tag', key: 'g', element: () => tagMenu.children[9], top: '-0.1em', left: '-1.3em' },
        { name: 'Tags', key: 't', element: tags, left: '500px', top: '200px', action: () => {
            tagNav = !tagNav;
            if (tagNav) {
                tagNavState = {x:0, y:0};
                addTagBorder();
            } else {
                removeTagBorder();
            }
            hideTagLabels();
            showLabels();
        } },
    ];
    // TODO: albert style launcher
    // TODO: load config from localstorage
    // TODO: import/export config

    function updateLabels() {
        for (const label of [...document.getElementsByClassName('ehp-label')]) {
            label.parentElement.removeChild(label);
        }
        actions = {};
        for (const label of labels) {
            const element = label.element && (label.element instanceof Node ? label.element : label.element()) || document.createElement('div');
            actions[label.key] = label.action || (element => () => { element.click(); })(element.querySelector('a'));
            if (element) {
                element.style.position = 'relative';
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
            element.appendChild(el);
        }



        for (const label of [...document.getElementsByClassName('ehp-tag-label')]) {
            label.parentElement.removeChild(label);
        }
        tagActions = {};
        for (const label of tagLabels) {
            const element = label.element && (label.element instanceof Node ? label.element : label.element()) || document.createElement('div');
            tagActions[label.key] = label.action || (element => () => { element.click(); })(element.querySelector('a'));
            if (element) {
                element.style.position = 'relative';
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
            el.classList.add('ehp-tag-label');
            if (label.action) {
                el.style.top = 'calc(50% - 0.5em)';
                el.style.left = 'calc(50% - 0.5em)';
            }
            if (label.top) { el.style.top = label.top; }
            if (label.left) { el.style.left = label.left; }
            el.innerText = label.key;
            element.appendChild(el);
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

    function hideTagLabels() {
        for (const label of document.getElementsByClassName('ehp-tag-label')) {
            label.style.display = 'none';
        }
    }

    function showTagLabels() {
        for (const label of document.getElementsByClassName('ehp-tag-label')) {
            label.style.display = null;
        }
    }

    function addLabel(label) {
        labels.push(label);
    }
    unsafeWindow.addLabel = addLabel;

    function removeLabel(name) {
        labels = labels.filter(label => label.name !== name);
    }
    unsafeWindow.removeLabel = removeLabel;

    updateLabels();
})();
