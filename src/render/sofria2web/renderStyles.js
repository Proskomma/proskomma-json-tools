const renderStyles = {
    paras: {
      default: {
        fontSize: "medium",
        marginTop: "0.5ex",
        marginBottom: "0.5ex",
      },
      "usfm:b": {
        height: "1em",
      },
      "usfm:d": {
        fontStyle: "italic",
      },
      "usfm:f": {
        fontSize: "small",
      },
      "usfm:hangingGraft": {},
      "usfm:imt": {
        fontWeight: "bold",
        fontStyle: "italic",
        fontSize: "xx-large",
        textAlign: "center",
      },
      "usfm:imt2": {
        fontWeight: "bold",
        fontStyle: "italic",
        fontSize: "x-large",
        textAlign: "center",
      },
      "usfm:imt3": {
        fontWeight: "bold",
        fontStyle: "italic",
        fontSize: "large",
        textAlign: "center",
      },
      "usfm:ip": {
        textIndent: "1.5em",
      },
      "usfm:ipi": {
        paddingLeft: "1.5em",
        textIndent: "1.5em",
      },
      "usfm:io": {
        paddingLeft: "1.5em",
      },
      "usfm:iot": {
        fontWeight: "bold",
        fontSize: "large",
      },
      "usfm:is": {
        fontStyle: "italic",
        fontSize: "xx-large",
      },
      "usfm:is2": {
        fontStyle: "italic",
        fontSize: "x-large",
      },
      "usfm:is3": {
        fontStyle: "italic",
        fontSize: "large",
      },
      "usfm:li": {
        listStyleType: "disc",
        paddingLeft: "3em",
        textIndent: "-1.5em",
      },
      "usfm:li2": {
        listStyleType: "disc",
        paddingLeft: "4.5em",
        textIndent: "-1.5em",
      },
      "usfm:li3": {
        listStyleType: "disc",
        paddingLeft: "6em",
        textIndent: "-1.5em",
      },
      "usfm:m": {},
      "usfm:mi": {
        paddingLeft: "1.5em",
      },
      "usfm:mr": {
        fontSize: "large",
        fontStyle: "italic",
      },
      "usfm:ms": {
        fontSize: "large",
        fontWeight: "bold",
      },
      "usfm:ms2": {
        fontWeight: "bold",
      },
      "usfm:mt": {
        fontWeight: "bold",
        fontStyle: "italic",
        fontSize: "xx-large",
        textAlign: "center",
      },
      "usfm:mt2": {
        fontWeight: "bold",
        fontStyle: "italic",
        fontSize: "x-large",
        textAlign: "center",
      },
      "usfm:mt3": {
        fontWeight: "bold",
        fontStyle: "italic",
        fontSize: "large",
        textAlign: "center",
      },
      "usfm:nb": {},
      "usfm:p": {
        textIndent: "1.5em",
      },
      "usfm:pc": {
        textAlign: "center",
      },
      "usfm:pi": {
        paddingLeft: "1.5em",
        textIndent: "1.5em",
      },
      "usfm:pi2": {
        paddingLeft: "3em",
        textIndent: "1.5em",
      },
      "usfm:pi3": {
        paddingLeft: "4.5em",
        textIndent: "1.5em",
      },
      "usfm:q": {
        paddingLeft: "1.5em",
        marginTop: "0.5ex",
        marginBottom: "0.5ex",
      },
      "usfm:q2": {
        paddingLeft: "3em",
        marginTop: "0.5ex",
        marginBottom: "0.5ex",
      },
      "usfm:q3": {
        paddingLeft: "4.5em",
        marginTop: "0.5ex",
        marginBottom: "0.5ex",
      },
      "usfm:q4": {
        paddingLeft: "6em",
        marginTop: "0.5ex",
        marginBottom: "0.5ex",
      },
      "usfm:qa": {
        fontWeight: "bold",
        fontSize: "x-large",
      },
      "usfm:qr": {
        textAlign: "right",
      },
      "usfm:r": {
        fontWeight: "bold",
      },
      "usfm:s": {
        fontStyle: "italic",
        fontSize: "xx-large",
      },
      "usfm:s2": {
        fontStyle: "italic",
        fontSize: "x-large",
      },
      "usfm:s3": {
        fontStyle: "italic",
        fontSize: "large",
      },
      "usfm:sr": {
        fontSize: "large",
      },
      "usfm:tr": {},
      "usfm:x": {
        fontSize: "small",
      },
    },
    marks: {
      default: {},
      chapter_label: {
        float: "left",
        fontSize: "xx-large",
        marginRight: "0.5em",
      },
      verses_label: {
        fontWeight: "bold",
        fontSize: "small",
        verticalAlign: "super",
        marginRight: "0.5em",
      },
    },
    wrappers: {
      default: {},
      "usfm:add": {
        fontStyle: "italic",
      },
      "usfm:bd": {
        fontWeight: "bold",
      },
      "usfm:bdit": {
        fontWeight: "bold",
        fontStyle: "italic",
      },
      "usfm:bk": {
        fontWeight: "bold",
      },
      chapter: {},
      "usfm:fl": {},
      "usfm:fm": {},
      "usfm:fq": {
        fontStyle: "italic",
      },
      "usfm:fqa": {
        fontStyle: "italic",
      },
      "usfm:fr": {
        fontWeight: "bold",
      },
      "usfm:ft": {},
      "usfm:it": {
        fontStyle: "italic",
      },
      "usfm:nd": {
        fontWeight: "bold",
        fontSize: "smaller",
        textTransform: "uppercase",
      },
      "usfm:qs": {
        float: "right",
        fontStyle: "italic",
      },
      "usfm:sc": {
        fontSize: "smaller",
        textTransform: "uppercase",
      },
      "usfm:tl": {
        fontStyle: "italic",
      },
      verses: {},
      "usfm:wj": {
        color: "#D00",
      },
      "usfm:xk": {},
      "usfm:xo": {
        fontWeight: "bold",
      },
      "usfm:xt": {},
    },
  };
  
  const StyleAsCSS = (options) => {
    for (const option in options) {
      let cssResult = `/* ${option} CSS format : */\n`;
      for (const op in options[option]) {
        if (op.includes(":")) {
          const newOp = op.replace(":", "_");
          cssResult += `  .${option}_${newOp
            .replace(/([A-Z])/g, "_$1")
            .toLowerCase()} {\n`;
        } else {
          cssResult += `  .${option}_${op
            .replace(/([A-Z])/g, "_$1")
            .toLowerCase()} {\n`;
        }
        const styles = options[option][op];
        for (const prop in styles) {
          for (const p in prop) {
            if (prop[p] === prop[p].toUpperCase()) {
              const newProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
              cssResult += `      ${newProp}: ${styles[prop]};\n`;
            }
          }
        }
        cssResult += "  }\n";
      }
      console.log(cssResult);
    }
  };
  
  function ConvertCssToReactNativeStyle(styleSheet) {
    //  note that this function is not exaustive and need futher adding. Unfortunatly not all css
    //is compatible with react native so be sure to check the documentation when adding css
    let copyStyleSheet = styleSheet;
    const keyFirstLayerArray = Object.keys(copyStyleSheet);
    keyFirstLayerArray.map((firstLayerKeys) => {
      const secondLayerKeysArray = Object.keys(copyStyleSheet[firstLayerKeys]);
      secondLayerKeysArray.map((secondLayerKey) => {
        const thirdLayerKeysArray = Object.keys(
          copyStyleSheet[firstLayerKeys][secondLayerKey]
        );
        thirdLayerKeysArray.map((thirdLayerKey) => {
          if (thirdLayerKey === "float") {
            if (
              copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] ===
              "left"
            ) {
              copyStyleSheet[firstLayerKeys][secondLayerKey]["textAlign"] =
                "left";
              delete copyStyleSheet[firstLayerKeys][secondLayerKey][
                thirdLayerKey
              ];
            }
          }
          if (thirdLayerKey === "verticalAlign") {
            if (
              copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] ===
              "super"
            ) {
              copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] =
                "top";
            }
          }
          if (thirdLayerKey === "textIndent") {
            if (
              copyStyleSheet[firstLayerKeys][secondLayerKey][
                thirdLayerKey
              ].includes("em")
            ) {
              let stringToChange =
                copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey];
              stringToChange.replace("em", "");
              copyStyleSheet[firstLayerKeys][secondLayerKey]["marginLeft"] =
                parseFloat(stringToChange) * 16;
              delete copyStyleSheet[firstLayerKeys][secondLayerKey][
                thirdLayerKey
              ];
            }
            delete copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey];
          }
          if (
            copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] ===
            "medium"
          ) {
            copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] = 16;
          }
          if (
            copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] ===
            "x-small"
          ) {
            copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] = 10;
          }
          if (
            copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] ===
            "xx-small"
          ) {
            copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] = 9;
          }
          if (
            copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] ===
            "small"
          ) {
            copyStyleSheet[firstLayerKeys][secondLayerKey][
              thirdLayerKey
            ] = 13.333;
          }
          if (
            copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] ===
            "large"
          ) {
            copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] = 18;
          }
          if (
            copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] ===
            "x-large"
          ) {
            copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] = 24;
          }
          if (
            copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] ===
            "xx-large"
          ) {
            copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] = 32;
          }
          if (
            typeof copyStyleSheet[firstLayerKeys][secondLayerKey][
              thirdLayerKey
            ] === typeof "string"
          ) {
            if (
              copyStyleSheet[firstLayerKeys][secondLayerKey][
                thirdLayerKey
              ].includes("em")
            ) {
              let stringToChange =
                copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey];
              stringToChange.replace("em", "");
              copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] =
                parseFloat(stringToChange) * 16;
              return;
            }
            if (
              copyStyleSheet[firstLayerKeys][secondLayerKey][
                thirdLayerKey
              ].includes("ex")
            ) {
              let stringToChange =
                copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey];
              stringToChange.replace("ex", "");
              copyStyleSheet[firstLayerKeys][secondLayerKey][thirdLayerKey] =
                parseFloat(stringToChange);
              return;
            }
          }
        });
      });
    });
    return copyStyleSheet;
  }

export { renderStyles, StyleAsCSS, ConvertCssToReactNativeStyle };