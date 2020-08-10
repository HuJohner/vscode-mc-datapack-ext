let config;
let doc;

// update
function update() {
    updateElement(doc, config, '');
    checkDocument(config, doc);
    sendMessage();
}

// doc fills html
function updateElement(doc, config, parent) {
    for (let key in doc) {
        console.debug({doc, config, parent, key});
        let docObj = doc[key];
        let configObj = config[key];

        let id = concatIds(parent, key);
        let html = document.getElementById(id);
        switch (configObj.type) {
            case 'ComboBox':
                html.querySelectorAll('select > option').forEach(option => {
                    if (option.value === docObj) {
                        option.selected = 'selected';
                    }
                });
                break;
            case 'TextBox':
                html.querySelector('input').value = docObj;
                break;
            case 'ColourPick':
                let dec = docObj;
                if (dec > 16777215) {
                    dec = 16777215;
                } else if (dec < 0) {
                    dec = 0;
                }
                html.querySelectorAll('input').forEach(input => {
                    if (input.type === 'text') {
                        input.value = dec;
                    } else if (input.type === 'color') {
                        input.value = '#' + String("000000" + dec.toString(16)).slice(-6);
                    }
                });
                break;
            case 'CheckBox':
                html.querySelector('input').checked = docObj;
                break;
            case 'Group':
            case 'List':
                if (configObj.children_type === 'children') {
                    updateElement(docObj, configObj.children, id);
                } else if (configObj.children_type === 'item') {
                    let listConfig = {};
                    for (let i in docObj) {
                        let item = document.getElementById(concatIds(id, i));
                        if (!item) {
                            let json = {};
                            json[i] = configObj.item;
                            generateHtmlFromJson(json, html.querySelector('details > fieldset'), id, true);
                        }
                        listConfig[i] = configObj.item;
                    }
                    updateElement(docObj, listConfig, id);
                }
                break;
        }

        if (configObj.conditional) {
            updateConditionals(docObj, config, key, parent);
        }
    }
}

// config checks for missing elements
function checkDocument(config, doc) {
    for (let key in config) {
        let configObj = config[key];
        if (!configObj.optional) {
            if (typeof doc[key] === 'undefined') {
                doc[key] = configObj.default;
                if (configObj.type === 'Group') {
                    doc[key] = {};
                } else if (configObj.type === 'List') {
                    doc[key] = [];
                }
            }

            let docObj = doc[key];
            if (configObj.children_type === 'children') {
                checkDocument(configObj.children, docObj);
            }
        }
    }
}

// config generates gtml
function generateHtmlFromJson(json, container, parent, isList) {
    for (let key in json) {
        let configObj = json[key];

        let div = document.createElement('div');
        div.id = concatIds(parent, key);
        div.className = 'row';
        if (configObj.hidden) {
            div.style.display = 'none';
        }
        let label = document.createElement('label');
        if (configObj.title !== undefined) {
            label.innerHTML = configObj.title;
        } else {
            label.innerHTML = key;
        }
        label.className = 'cell';
        div.appendChild(label);

        let removeContainer = div;
        switch (configObj.type) {
            case "ComboBox":
                let select = document.createElement('select');
                select.className = 'cell';
                for (let value of configObj.values) {
                    let item = document.createElement('option');
                    item.value = value;
                    item.innerHTML = value;
                    if (value === configObj.default) {
                        item.selected = 'selected';
                    }
                    select.appendChild(item);
                }
                select.oninput = changeInput;
                div.appendChild(select);
                break;
            case "TextBox":
                let input = document.createElement('input');
                input.className = 'cell';
                switch (configObj.text_type) {
                    case 'integer':
                        input.type = 'number';
                        break;
                    case 'double':
                        input.type = 'number';
                        input.step = '0.01';
                        break;
                    default:
                        input.type = 'text';
                }
                input.min = configObj.min;
                input.max = configObj.max;
                input.value = configObj.default;
                input.oninput = changeInput;
                if (configObj.conditional) {
                    input.oninput = function(event) {
                        changeInput(event);
                        updateConditionals(event.target.value, json, key, parent);
                    };
                }
                div.appendChild(input);
                break;
            case "ColourPick":
                let text = document.createElement('input');
                text.type = 'text';
                text.value = configObj.default;
                text.className = 'cell';
                text.oninput = changeInput;
                div.appendChild(text);
                let colour = document.createElement('input');
                colour.type = 'color';
                colour.value = '#' + configObj.default.toString(16);
                colour.className = 'cell';
                colour.oninput = changeInput;
                div.appendChild(colour);
                break;
            case "CheckBox":
                let checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'cell';
                checkbox.oninput = changeInput;
                if (configObj.default === 'true') {
                    checkbox.checked = true;
                }
                div.appendChild(checkbox);
                break;
            case "Group":
            case "List":
                div.innerHTML = '';
                let details = document.createElement('details');
                details.className = 'col-span';

                let summary = document.createElement('summary');
                if (configObj.title !== undefined) {
                    summary.innerHTML = configObj.title;
                } else {
                    summary.innerHTML = key;
                }
                details.appendChild(summary);
                removeContainer = summary;

                let fieldset = document.createElement('fieldset');
                details.appendChild(fieldset);

                if (configObj.children_type === 'item') {
                    let name = document.createElement('input');
                    name.className = 'add-text';
                    name.type = 'text';
                    if (configObj.placeholder) {
                        name.placeholder = configObj.placeholder;
                    }
                    name.oninput = function (event) {
                        let children = [];
                        fieldset.childNodes.forEach(elem => {
                            if (elem.nodeName === 'DIV') {
                                let split = elem.id.split('.');
                                children.push(split[split.length - 1]);
                            }
                        });
                        if (!children.includes(event.target.value)) {
                            button.disabled = false;
                            event.target.style.backgroundColor = '';
                        } else {
                            button.disabled = true;
                            event.target.style.backgroundColor = 'red';
                        }
                    };

                    let button = document.createElement('button');
                    button.className = 'add';
                    button.innerHTML = '+';
                    button.onclick = function (event) {
                        let i = name.value;
                        if (!i) {
                            i = event.target.parentNode.children.length - 2;
                        }
                        let id = concatIds(div.id, i);

                        let value;
                        switch (configObj.item.type) {
                            case 'TextBox':
                                value = "";
                                break;
                            case 'Group':
                                value = {};
                                break;
                            case 'List':
                                value = [];
                                break;
                        }

                        setValueByKeys(doc, config, id.split('.'), value);
                        sendMessage();
                        name.value = '';
                    };
                    fieldset.appendChild(name);
                    fieldset.appendChild(button);

                    if (!configObj.namable) {
                        name.style.display = 'none';
                    }
                } else {
                    generateHtmlFromJson(configObj.children, fieldset, div.id);
                }

                div.appendChild(details);
                break;
        }

        if (isList) {
            let removeButton = document.createElement('button');
            removeButton.className = 'remove';
            removeButton.innerHTML = '-';
            removeButton.onclick = function (event) {
                let elem = event.target.closest('div');
                let id = elem.id;

                removeValueByKeys(doc, config, id.split('.'));
                sendMessage();

                elem.parentNode.lastChild.previousSibling.previousSibling.remove();
            };
            removeContainer.appendChild(removeButton);
        }

        let plusText = container.querySelector(':scope > input.add-text');
        if (plusText) {
            container.insertBefore(div, plusText);
        } else {
            container.appendChild(div);
        }
    }
}

// on input change
function changeInput(event) {
    let ids = event.target.id.split('.');
    if (ids.length === 0 || !ids[0]) {
        ids = event.target.parentNode.id.split('.');
    }
    let value = event.target.value;
    if (event.target.tagName === 'select') {
        event.target.childNodes.forEach(option => {
            if (option.selected === 'selected') {
                value = option.value;
            }
        });
    } else if (event.target.type === 'checkbox') {
        value = event.target.checked;
    } else if (event.target.type === 'color') {
        value = parseInt(event.target.value.substr(1), 16);
    }

    setValueByKeys(doc, config, ids, value);
    sendMessage();
}

// set value into doc
function setValueByKeys(doc, config, keys, value) {
    let i = keys.shift();
    let configObj = config[i];

    let val = value;
    if (configObj.text_type === 'integer' || configObj.colour_type === 'decimal') {
        val = parseInt(value);
    } else if (configObj.text_type === 'double') {
        val = parseFloat(value);
    }

    if (!doc[i]) {
        if (configObj.type === 'Group') {
            doc[i] = {};
        } else if (configObj.type === 'List') {
            doc[i] = [];
        }
    }

    if (keys.length === 0) {
        return doc[i] = val;
    }

    let configChild = configObj.children;
    if (!configChild) {
        configChild = {};
        configChild[keys[0]] = configObj.item;
    }
    return setValueByKeys(doc[i], configChild, keys, val);
}

// remove value from doc
function removeValueByKeys(doc, config, keys) {
    let i = keys.shift();
    let configObj = config[i];

    if (keys.length === 0) {
        if (Array.isArray(doc)) {
            return doc.splice(i, 1);
        }
        return doc[i] = undefined;
    }

    let configChild = configObj.children;
    if (!configChild) {
        configChild = {};
        configChild[keys[0]] = configObj.item;
    }
    return removeValueByKeys(doc[i], configChild, keys);
}

// concat helper
function concatIds(id1, id2) {
    let result = id1;
    if ((id1 || id1 === 0) && (id2 || id2 === 0)) {
        result += '.' + id2;
    } else {
        result = id2;
    }
    return result;
}

function updateConditionals(value, config, key, parent) {
    let target;
    let list;
    for (let k in config[key].conditional) {
        if (k.split(',').includes(value)) {
            target = config[key].conditional[k].target;
            list = config[key].conditional[k].tags;
            break;
        }
    }

    if (target) {
        let parentElem = document.getElementById(concatIds(target, key)).parentNode;
        parentElem.childNodes.forEach(e => {
            let id = e.id.split('.').pop();
            if (config[id] && config[id].hidden) {
                if (list && list.includes(id)) {
                    e.style.display = '';
                } else if (config[id] && config[id].hidden) {
                    e.style.display = 'none';
                }
            }
        });
    }
}