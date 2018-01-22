export default (str) => str.split('').map(function (value, index, array) {
    const temp = value.charCodeAt(0).toString(16).toUpperCase();
    if (temp.length > 2) {
        return '\\' + temp;
    }
    return value;
}).join('');