const regexNumber = /(?:\d+,)*\d+(?:\.\d+)?/i;
const regexFraction = /(?:\d\/\d)/i;
const imperialUnits = [
    {
        convertFrom: 'pound',
        convertTo: 'kg',
        conversionRatio: 0.45359237,
        regex: /(?:(pound|lb)s?)/i,
    },
    {
        convertFrom: 'ounce',
        convertTo: 'g',
        conversionRatio: 28.349523125,
        regex: /(?:ounces?|oz)/i,
    },
    {
        convertFrom: 'mile',
        convertTo: 'km',
        conversionRatio: 1.609344,
        regex: /(?:miles?|mi)/i,
    },
    {
        convertFrom: 'yard',
        convertTo: 'm',
        conversionRatio: 0.9144,
        regex: /(?:yards?|yd)/i,
    },
    {
        convertFrom: 'foot',
        convertTo: 'm',
        conversionRatio: 0.3048,
        regex: /(?:foot|feet|ft|')/i,
    },
    {
        convertFrom: 'inch',
        convertTo: 'cm',
        conversionRatio: 2.54,
        regex: /(?:inch|inches|")/i,
    },
];

let regexImperialUnits = imperialUnits[0].regex.source;
for (let i = 1; i < imperialUnits.length; i++) {
    regexImperialUnits += `|${imperialUnits[i].regex.source}`;
}
const regex = new RegExp(
    `(?:${regexNumber.source}|${regexFraction.source})(\\s|-)?(?:${regexImperialUnits})\\b`,
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

    node.nodeValue.replace(regex, function (match, p1, p2, offset) {
        const internationalUnit = convertUnit(match);
        let newNode = node.splitText(offset + deltaOffset);
        deltaOffset -= node.nodeValue.length + match.length;
        newNode.nodeValue = newNode.nodeValue.substr(match.length);
        node.parentNode.insertBefore(
            createSpanElement(match, internationalUnit),
            newNode
        );
        node = newNode;
    });
}

function convertUnit(imperialUnit) {
    let number, conversionRatio, convertTo;
    if (regexFraction.test(imperialUnit)) {
        const fraction = imperialUnit.match(regexFraction)[0].split('/');
        number = fraction[0] / fraction[1];
    } else if (regexNumber.test(imperialUnit)) {
        number = parseFloat(
            imperialUnit.match(regexNumber)[0].replace(',', '')
        );
    }
    imperialUnits.forEach((element) => {
        if (element.regex.test(imperialUnit)) {
            conversionRatio = element.conversionRatio;
            convertTo = element.convertTo;
        }
    });
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
