const regexNumber = /(?:\d+,)*\d+(?:\.\d+)?/gi;
const regexFraction = /(?:\d\/\d)/gi;
const regexPound = new RegExp(
    '(?:(?:' +
        regexNumber.source +
        ')|' +
        regexFraction.source +
        ')(\\s|-)?(lb|pound)s?',
    'gi'
);

function findTextNodes(node) {
    const nodeType = node.nodeType;
    let child, next;

    if (nodeType === Node.TEXT_NODE) {
        handleTextNode(node);
    } else if (otherNode(nodeType)) {
        child = node.firstChild;
        while (child) {
            next = child.nextSibling;
            findTextNodes(child);
            child = next;
        }
    }
}

function otherNode(nodeType) {
    return (
        nodeType === Node.ELEMENT_NODE ||
        nodeType === Node.DOCUMENT_NODE ||
        nodeType === Node.DOCUMENT_FRAGMENT_NODE
    );
}

function handleTextNode(node) {
    let deltaOffset = 0;
    node.nodeValue.replace(regexPound, function (match, p1, p2, offset) {
        let number = convertUnit(match);
        let newNode = node.splitText(offset + deltaOffset);
        deltaOffset -= node.nodeValue.length + match.length;
        newNode.nodeValue = newNode.nodeValue.substr(match.length);
        node.parentNode.insertBefore(createSpanElement(number, match), newNode);
        node = newNode;
    });
}

function convertUnit(unitString) {
    let number;
    if (regexFraction.test(unitString)) {
        let fraction = unitString.match(regexFraction)[0].split('/');
        number = fraction[0] / fraction[1];
    } else if (regexNumber.test(unitString)) {
        number = parseFloat(unitString.match(regexNumber)[0].replace(',', ''));
    }
    number /= 2.20462;
    number = number.toFixed(2);
    return number.toString();
}

function createSpanElement(internationalUnit, imperialUnit) {
    let span = document.createElement('span');
    span.title = `${internationalUnit} kg`;
    span.className = 'unitConverter';
    span.textContent = imperialUnit;
    return span;
}

findTextNodes(document.body);
