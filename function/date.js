Date.shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function short_months(dt) {
    return Date.shortMonths[dt.getMonth()];
}

module.exports = {
    short_months,

}