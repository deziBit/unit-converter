const regexNumber = /(?:\d+,)*\d+(?:\.\d+)?/gi;
const regexFraction = /(?:\d\/\d)/gi;
const imperialUnits = [
    {
        convertFrom: 'pound',
        convertTo: 'kg',
        conversionRatio: 0.45359237,
        regex: /(pound|lb)s?/gi,
    },
    {
        convertFrom: 'mile',
        convertTo: 'km',
        conversionRatio: 1.609344,
        regex: /(miles?|mi)/gi,
    },
];

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
    imperialUnits.forEach((unit) => {
        let regex = new RegExp(
            '(?:(?:' +
                regexNumber.source +
                ')|' +
                regexFraction.source +
                ')(\\s|-)?' +
                unit.regex.source,
            'gi'
        );

        node.nodeValue.replace(regex, function (match, p1, p2, offset) {
            let number = convertUnit(
                match,
                unit.conversionRatio,
                unit.convertTo
            );
            let newNode = node.splitText(offset + deltaOffset);
            deltaOffset -= node.nodeValue.length + match.length;
            newNode.nodeValue = newNode.nodeValue.substr(match.length);
            node.parentNode.insertBefore(
                createSpanElement(match, number),
                newNode
            );
            node = newNode;
        });
    });
}

function convertUnit(unitString, conversionRatio, convertTo) {
    let number;
    if (regexFraction.test(unitString)) {
        let fraction = unitString.match(regexFraction)[0].split('/');
        number = fraction[0] / fraction[1];
    } else if (regexNumber.test(unitString)) {
        number = parseFloat(unitString.match(regexNumber)[0].replace(',', ''));
    }
    number *= conversionRatio;
    number = number.toFixed(2);
    return `${number.toString()} ${convertTo}`;
}

function createSpanElement(imperialUnit, internationalUnit) {
    let span = document.createElement('span');
    span.title = internationalUnit;
    span.className = 'unitConverter';
    span.textContent = imperialUnit;
    return span;
}

findTextNodes(document.body);
