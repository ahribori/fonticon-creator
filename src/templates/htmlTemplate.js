export default (fontFamily, iconList) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Demo</title>
    <link rel="stylesheet" href="css/${fontFamily}.css">
    <style>
        .container {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
        }
        .container > span {
            display: inline-flex;
            align-items: center;
            flex-basis: 250px;
            height: 50px;
        }
        .container > span:before {
            font-size: 1.5rem;
        }
        .container > span:hover {
            background-color: beige;
        }
    </style>
</head>
<body>
<div class="container">
${iconList}
</div>
</body>
</html>
`;
