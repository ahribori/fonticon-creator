export default (fontFamily, iconList) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Demo</title>
    <link rel="stylesheet" href="css/${fontFamily}.css">
</head>
<body>
${iconList}
</body>
</html>
`