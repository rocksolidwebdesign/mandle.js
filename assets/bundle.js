(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// TinyColor v1.0.0
// https://github.com/bgrins/TinyColor
// Brian Grinstead, MIT License

(function() {

var trimLeft = /^[\s,#]+/,
    trimRight = /\s+$/,
    tinyCounter = 0,
    math = Math,
    mathRound = math.round,
    mathMin = math.min,
    mathMax = math.max,
    mathRandom = math.random;

var tinycolor = function tinycolor (color, opts) {

    color = (color) ? color : '';
    opts = opts || { };

    // If input is already a tinycolor, return itself
    if (color instanceof tinycolor) {
       return color;
    }
    // If we are called as a function, call using new instead
    if (!(this instanceof tinycolor)) {
        return new tinycolor(color, opts);
    }

    var rgb = inputToRGB(color);
    this._r = rgb.r,
    this._g = rgb.g,
    this._b = rgb.b,
    this._a = rgb.a,
    this._roundA = mathRound(100*this._a) / 100,
    this._format = opts.format || rgb.format;
    this._gradientType = opts.gradientType;

    // Don't let the range of [0,255] come back in [0,1].
    // Potentially lose a little bit of precision here, but will fix issues where
    // .5 gets interpreted as half of the total, instead of half of 1
    // If it was supposed to be 128, this was already taken care of by `inputToRgb`
    if (this._r < 1) { this._r = mathRound(this._r); }
    if (this._g < 1) { this._g = mathRound(this._g); }
    if (this._b < 1) { this._b = mathRound(this._b); }

    this._ok = rgb.ok;
    this._tc_id = tinyCounter++;
};

tinycolor.prototype = {
    isDark: function() {
        return this.getBrightness() < 128;
    },
    isLight: function() {
        return !this.isDark();
    },
    isValid: function() {
        return this._ok;
    },
    getFormat: function() {
        return this._format;
    },
    getAlpha: function() {
        return this._a;
    },
    getBrightness: function() {
        var rgb = this.toRgb();
        return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    },
    setAlpha: function(value) {
        this._a = boundAlpha(value);
        this._roundA = mathRound(100*this._a) / 100;
        return this;
    },
    toHsv: function() {
        var hsv = rgbToHsv(this._r, this._g, this._b);
        return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
    },
    toHsvString: function() {
        var hsv = rgbToHsv(this._r, this._g, this._b);
        var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
        return (this._a == 1) ?
          "hsv("  + h + ", " + s + "%, " + v + "%)" :
          "hsva(" + h + ", " + s + "%, " + v + "%, "+ this._roundA + ")";
    },
    toHsl: function() {
        var hsl = rgbToHsl(this._r, this._g, this._b);
        return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
    },
    toHslString: function() {
        var hsl = rgbToHsl(this._r, this._g, this._b);
        var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
        return (this._a == 1) ?
          "hsl("  + h + ", " + s + "%, " + l + "%)" :
          "hsla(" + h + ", " + s + "%, " + l + "%, "+ this._roundA + ")";
    },
    toHex: function(allow3Char) {
        return rgbToHex(this._r, this._g, this._b, allow3Char);
    },
    toHexString: function(allow3Char) {
        return '#' + this.toHex(allow3Char);
    },
    toHex8: function() {
        return rgbaToHex(this._r, this._g, this._b, this._a);
    },
    toHex8String: function() {
        return '#' + this.toHex8();
    },
    toRgb: function() {
        return { r: mathRound(this._r), g: mathRound(this._g), b: mathRound(this._b), a: this._a };
    },
    toRgbString: function() {
        return (this._a == 1) ?
          "rgb("  + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ")" :
          "rgba(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ", " + this._roundA + ")";
    },
    toPercentageRgb: function() {
        return { r: mathRound(bound01(this._r, 255) * 100) + "%", g: mathRound(bound01(this._g, 255) * 100) + "%", b: mathRound(bound01(this._b, 255) * 100) + "%", a: this._a };
    },
    toPercentageRgbString: function() {
        return (this._a == 1) ?
          "rgb("  + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%)" :
          "rgba(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
    },
    toName: function() {
        if (this._a === 0) {
            return "transparent";
        }

        if (this._a < 1) {
            return false;
        }

        return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
    },
    toFilter: function(secondColor) {
        var hex8String = '#' + rgbaToHex(this._r, this._g, this._b, this._a);
        var secondHex8String = hex8String;
        var gradientType = this._gradientType ? "GradientType = 1, " : "";

        if (secondColor) {
            var s = tinycolor(secondColor);
            secondHex8String = s.toHex8String();
        }

        return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr="+hex8String+",endColorstr="+secondHex8String+")";
    },
    toString: function(format) {
        var formatSet = !!format;
        format = format || this._format;

        var formattedString = false;
        var hasAlpha = this._a < 1 && this._a >= 0;
        var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "name");

        if (needsAlphaFormat) {
            // Special case for "transparent", all other non-alpha formats
            // will return rgba when there is transparency.
            if (format === "name" && this._a === 0) {
                return this.toName();
            }
            return this.toRgbString();
        }
        if (format === "rgb") {
            formattedString = this.toRgbString();
        }
        if (format === "prgb") {
            formattedString = this.toPercentageRgbString();
        }
        if (format === "hex" || format === "hex6") {
            formattedString = this.toHexString();
        }
        if (format === "hex3") {
            formattedString = this.toHexString(true);
        }
        if (format === "hex8") {
            formattedString = this.toHex8String();
        }
        if (format === "name") {
            formattedString = this.toName();
        }
        if (format === "hsl") {
            formattedString = this.toHslString();
        }
        if (format === "hsv") {
            formattedString = this.toHsvString();
        }

        return formattedString || this.toHexString();
    },

    _applyModification: function(fn, args) {
        var color = fn.apply(null, [this].concat([].slice.call(args)));
        this._r = color._r;
        this._g = color._g;
        this._b = color._b;
        this.setAlpha(color._a);
        return this;
    },
    lighten: function() {
        return this._applyModification(lighten, arguments);
    },
    brighten: function() {
        return this._applyModification(brighten, arguments);
    },
    darken: function() {
        return this._applyModification(darken, arguments);
    },
    desaturate: function() {
        return this._applyModification(desaturate, arguments);
    },
    saturate: function() {
        return this._applyModification(saturate, arguments);
    },
    greyscale: function() {
        return this._applyModification(greyscale, arguments);
    },
    spin: function() {
        return this._applyModification(spin, arguments);
    },

    _applyCombination: function(fn, args) {
        return fn.apply(null, [this].concat([].slice.call(args)));
    },
    analogous: function() {
        return this._applyCombination(analogous, arguments);
    },
    complement: function() {
        return this._applyCombination(complement, arguments);
    },
    monochromatic: function() {
        return this._applyCombination(monochromatic, arguments);
    },
    splitcomplement: function() {
        return this._applyCombination(splitcomplement, arguments);
    },
    triad: function() {
        return this._applyCombination(triad, arguments);
    },
    tetrad: function() {
        return this._applyCombination(tetrad, arguments);
    }
};

// If input is an object, force 1 into "1.0" to handle ratios properly
// String input requires "1.0" as input, so 1 will be treated as 1
tinycolor.fromRatio = function(color, opts) {
    if (typeof color == "object") {
        var newColor = {};
        for (var i in color) {
            if (color.hasOwnProperty(i)) {
                if (i === "a") {
                    newColor[i] = color[i];
                }
                else {
                    newColor[i] = convertToPercentage(color[i]);
                }
            }
        }
        color = newColor;
    }

    return tinycolor(color, opts);
};

// Given a string or object, convert that input to RGB
// Possible string inputs:
//
//     "red"
//     "#f00" or "f00"
//     "#ff0000" or "ff0000"
//     "#ff000000" or "ff000000"
//     "rgb 255 0 0" or "rgb (255, 0, 0)"
//     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
//     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
//     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
//     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
//     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
//     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
//
function inputToRGB(color) {

    var rgb = { r: 0, g: 0, b: 0 };
    var a = 1;
    var ok = false;
    var format = false;

    if (typeof color == "string") {
        color = stringInputToObject(color);
    }

    if (typeof color == "object") {
        if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
            rgb = rgbToRgb(color.r, color.g, color.b);
            ok = true;
            format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
        }
        else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
            color.s = convertToPercentage(color.s);
            color.v = convertToPercentage(color.v);
            rgb = hsvToRgb(color.h, color.s, color.v);
            ok = true;
            format = "hsv";
        }
        else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
            color.s = convertToPercentage(color.s);
            color.l = convertToPercentage(color.l);
            rgb = hslToRgb(color.h, color.s, color.l);
            ok = true;
            format = "hsl";
        }

        if (color.hasOwnProperty("a")) {
            a = color.a;
        }
    }

    a = boundAlpha(a);

    return {
        ok: ok,
        format: color.format || format,
        r: mathMin(255, mathMax(rgb.r, 0)),
        g: mathMin(255, mathMax(rgb.g, 0)),
        b: mathMin(255, mathMax(rgb.b, 0)),
        a: a
    };
}


// Conversion Functions
// --------------------

// `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
// <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

// `rgbToRgb`
// Handle bounds / percentage checking to conform to CSS color spec
// <http://www.w3.org/TR/css3-color/>
// *Assumes:* r, g, b in [0, 255] or [0, 1]
// *Returns:* { r, g, b } in [0, 255]
function rgbToRgb(r, g, b){
    return {
        r: bound01(r, 255) * 255,
        g: bound01(g, 255) * 255,
        b: bound01(b, 255) * 255
    };
}

// `rgbToHsl`
// Converts an RGB color value to HSL.
// *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
// *Returns:* { h, s, l } in [0,1]
function rgbToHsl(r, g, b) {

    r = bound01(r, 255);
    g = bound01(g, 255);
    b = bound01(b, 255);

    var max = mathMax(r, g, b), min = mathMin(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min) {
        h = s = 0; // achromatic
    }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return { h: h, s: s, l: l };
}

// `hslToRgb`
// Converts an HSL color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
function hslToRgb(h, s, l) {
    var r, g, b;

    h = bound01(h, 360);
    s = bound01(s, 100);
    l = bound01(l, 100);

    function hue2rgb(p, q, t) {
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }

    if(s === 0) {
        r = g = b = l; // achromatic
    }
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return { r: r * 255, g: g * 255, b: b * 255 };
}

// `rgbToHsv`
// Converts an RGB color value to HSV
// *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
// *Returns:* { h, s, v } in [0,1]
function rgbToHsv(r, g, b) {

    r = bound01(r, 255);
    g = bound01(g, 255);
    b = bound01(b, 255);

    var max = mathMax(r, g, b), min = mathMin(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max === 0 ? 0 : d / max;

    if(max == min) {
        h = 0; // achromatic
    }
    else {
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h, s: s, v: v };
}

// `hsvToRgb`
// Converts an HSV color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
 function hsvToRgb(h, s, v) {

    h = bound01(h, 360) * 6;
    s = bound01(s, 100);
    v = bound01(v, 100);

    var i = math.floor(h),
        f = h - i,
        p = v * (1 - s),
        q = v * (1 - f * s),
        t = v * (1 - (1 - f) * s),
        mod = i % 6,
        r = [v, q, p, p, t, v][mod],
        g = [t, v, v, q, p, p][mod],
        b = [p, p, t, v, v, q][mod];

    return { r: r * 255, g: g * 255, b: b * 255 };
}

// `rgbToHex`
// Converts an RGB color to hex
// Assumes r, g, and b are contained in the set [0, 255]
// Returns a 3 or 6 character hex
function rgbToHex(r, g, b, allow3Char) {

    var hex = [
        pad2(mathRound(r).toString(16)),
        pad2(mathRound(g).toString(16)),
        pad2(mathRound(b).toString(16))
    ];

    // Return a 3 character hex if possible
    if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
        return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
    }

    return hex.join("");
}
    // `rgbaToHex`
    // Converts an RGBA color plus alpha transparency to hex
    // Assumes r, g, b and a are contained in the set [0, 255]
    // Returns an 8 character hex
    function rgbaToHex(r, g, b, a) {

        var hex = [
            pad2(convertDecimalToHex(a)),
            pad2(mathRound(r).toString(16)),
            pad2(mathRound(g).toString(16)),
            pad2(mathRound(b).toString(16))
        ];

        return hex.join("");
    }

// `equals`
// Can be called with any tinycolor input
tinycolor.equals = function (color1, color2) {
    if (!color1 || !color2) { return false; }
    return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
};
tinycolor.random = function() {
    return tinycolor.fromRatio({
        r: mathRandom(),
        g: mathRandom(),
        b: mathRandom()
    });
};


// Modification Functions
// ----------------------
// Thanks to less.js for some of the basics here
// <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

function desaturate(color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.s -= amount / 100;
    hsl.s = clamp01(hsl.s);
    return tinycolor(hsl);
}

function saturate(color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.s += amount / 100;
    hsl.s = clamp01(hsl.s);
    return tinycolor(hsl);
}

function greyscale(color) {
    return tinycolor(color).desaturate(100);
}

function lighten (color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.l += amount / 100;
    hsl.l = clamp01(hsl.l);
    return tinycolor(hsl);
}

function brighten(color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var rgb = tinycolor(color).toRgb();
    rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * - (amount / 100))));
    rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * - (amount / 100))));
    rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * - (amount / 100))));
    return tinycolor(rgb);
}

function darken (color, amount) {
    amount = (amount === 0) ? 0 : (amount || 10);
    var hsl = tinycolor(color).toHsl();
    hsl.l -= amount / 100;
    hsl.l = clamp01(hsl.l);
    return tinycolor(hsl);
}

// Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
// Values outside of this range will be wrapped into this range.
function spin(color, amount) {
    var hsl = tinycolor(color).toHsl();
    var hue = (mathRound(hsl.h) + amount) % 360;
    hsl.h = hue < 0 ? 360 + hue : hue;
    return tinycolor(hsl);
}

// Combination Functions
// ---------------------
// Thanks to jQuery xColor for some of the ideas behind these
// <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

function complement(color) {
    var hsl = tinycolor(color).toHsl();
    hsl.h = (hsl.h + 180) % 360;
    return tinycolor(hsl);
}

function triad(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [
        tinycolor(color),
        tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
        tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
    ];
}

function tetrad(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [
        tinycolor(color),
        tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
        tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
        tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
    ];
}

function splitcomplement(color) {
    var hsl = tinycolor(color).toHsl();
    var h = hsl.h;
    return [
        tinycolor(color),
        tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
        tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
    ];
}

function analogous(color, results, slices) {
    results = results || 6;
    slices = slices || 30;

    var hsl = tinycolor(color).toHsl();
    var part = 360 / slices;
    var ret = [tinycolor(color)];

    for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
        hsl.h = (hsl.h + part) % 360;
        ret.push(tinycolor(hsl));
    }
    return ret;
}

function monochromatic(color, results) {
    results = results || 6;
    var hsv = tinycolor(color).toHsv();
    var h = hsv.h, s = hsv.s, v = hsv.v;
    var ret = [];
    var modification = 1 / results;

    while (results--) {
        ret.push(tinycolor({ h: h, s: s, v: v}));
        v = (v + modification) % 1;
    }

    return ret;
}

// Utility Functions
// ---------------------

tinycolor.mix = function(color1, color2, amount) {
    amount = (amount === 0) ? 0 : (amount || 50);

    var rgb1 = tinycolor(color1).toRgb();
    var rgb2 = tinycolor(color2).toRgb();

    var p = amount / 100;
    var w = p * 2 - 1;
    var a = rgb2.a - rgb1.a;

    var w1;

    if (w * a == -1) {
        w1 = w;
    } else {
        w1 = (w + a) / (1 + w * a);
    }

    w1 = (w1 + 1) / 2;

    var w2 = 1 - w1;

    var rgba = {
        r: rgb2.r * w1 + rgb1.r * w2,
        g: rgb2.g * w1 + rgb1.g * w2,
        b: rgb2.b * w1 + rgb1.b * w2,
        a: rgb2.a * p  + rgb1.a * (1 - p)
    };

    return tinycolor(rgba);
};


// Readability Functions
// ---------------------
// <http://www.w3.org/TR/AERT#color-contrast>

// `readability`
// Analyze the 2 colors and returns an object with the following properties:
//    `brightness`: difference in brightness between the two colors
//    `color`: difference in color/hue between the two colors
tinycolor.readability = function(color1, color2) {
    var c1 = tinycolor(color1);
    var c2 = tinycolor(color2);
    var rgb1 = c1.toRgb();
    var rgb2 = c2.toRgb();
    var brightnessA = c1.getBrightness();
    var brightnessB = c2.getBrightness();
    var colorDiff = (
        Math.max(rgb1.r, rgb2.r) - Math.min(rgb1.r, rgb2.r) +
        Math.max(rgb1.g, rgb2.g) - Math.min(rgb1.g, rgb2.g) +
        Math.max(rgb1.b, rgb2.b) - Math.min(rgb1.b, rgb2.b)
    );

    return {
        brightness: Math.abs(brightnessA - brightnessB),
        color: colorDiff
    };
};

// `readable`
// http://www.w3.org/TR/AERT#color-contrast
// Ensure that foreground and background color combinations provide sufficient contrast.
// *Example*
//    tinycolor.isReadable("#000", "#111") => false
tinycolor.isReadable = function(color1, color2) {
    var readability = tinycolor.readability(color1, color2);
    return readability.brightness > 125 && readability.color > 500;
};

// `mostReadable`
// Given a base color and a list of possible foreground or background
// colors for that base, returns the most readable color.
// *Example*
//    tinycolor.mostReadable("#123", ["#fff", "#000"]) => "#000"
tinycolor.mostReadable = function(baseColor, colorList) {
    var bestColor = null;
    var bestScore = 0;
    var bestIsReadable = false;
    for (var i=0; i < colorList.length; i++) {

        // We normalize both around the "acceptable" breaking point,
        // but rank brightness constrast higher than hue.

        var readability = tinycolor.readability(baseColor, colorList[i]);
        var readable = readability.brightness > 125 && readability.color > 500;
        var score = 3 * (readability.brightness / 125) + (readability.color / 500);

        if ((readable && ! bestIsReadable) ||
            (readable && bestIsReadable && score > bestScore) ||
            ((! readable) && (! bestIsReadable) && score > bestScore)) {
            bestIsReadable = readable;
            bestScore = score;
            bestColor = tinycolor(colorList[i]);
        }
    }
    return bestColor;
};


// Big List of Colors
// ------------------
// <http://www.w3.org/TR/css3-color/#svg-color>
var names = tinycolor.names = {
    aliceblue: "f0f8ff",
    antiquewhite: "faebd7",
    aqua: "0ff",
    aquamarine: "7fffd4",
    azure: "f0ffff",
    beige: "f5f5dc",
    bisque: "ffe4c4",
    black: "000",
    blanchedalmond: "ffebcd",
    blue: "00f",
    blueviolet: "8a2be2",
    brown: "a52a2a",
    burlywood: "deb887",
    burntsienna: "ea7e5d",
    cadetblue: "5f9ea0",
    chartreuse: "7fff00",
    chocolate: "d2691e",
    coral: "ff7f50",
    cornflowerblue: "6495ed",
    cornsilk: "fff8dc",
    crimson: "dc143c",
    cyan: "0ff",
    darkblue: "00008b",
    darkcyan: "008b8b",
    darkgoldenrod: "b8860b",
    darkgray: "a9a9a9",
    darkgreen: "006400",
    darkgrey: "a9a9a9",
    darkkhaki: "bdb76b",
    darkmagenta: "8b008b",
    darkolivegreen: "556b2f",
    darkorange: "ff8c00",
    darkorchid: "9932cc",
    darkred: "8b0000",
    darksalmon: "e9967a",
    darkseagreen: "8fbc8f",
    darkslateblue: "483d8b",
    darkslategray: "2f4f4f",
    darkslategrey: "2f4f4f",
    darkturquoise: "00ced1",
    darkviolet: "9400d3",
    deeppink: "ff1493",
    deepskyblue: "00bfff",
    dimgray: "696969",
    dimgrey: "696969",
    dodgerblue: "1e90ff",
    firebrick: "b22222",
    floralwhite: "fffaf0",
    forestgreen: "228b22",
    fuchsia: "f0f",
    gainsboro: "dcdcdc",
    ghostwhite: "f8f8ff",
    gold: "ffd700",
    goldenrod: "daa520",
    gray: "808080",
    green: "008000",
    greenyellow: "adff2f",
    grey: "808080",
    honeydew: "f0fff0",
    hotpink: "ff69b4",
    indianred: "cd5c5c",
    indigo: "4b0082",
    ivory: "fffff0",
    khaki: "f0e68c",
    lavender: "e6e6fa",
    lavenderblush: "fff0f5",
    lawngreen: "7cfc00",
    lemonchiffon: "fffacd",
    lightblue: "add8e6",
    lightcoral: "f08080",
    lightcyan: "e0ffff",
    lightgoldenrodyellow: "fafad2",
    lightgray: "d3d3d3",
    lightgreen: "90ee90",
    lightgrey: "d3d3d3",
    lightpink: "ffb6c1",
    lightsalmon: "ffa07a",
    lightseagreen: "20b2aa",
    lightskyblue: "87cefa",
    lightslategray: "789",
    lightslategrey: "789",
    lightsteelblue: "b0c4de",
    lightyellow: "ffffe0",
    lime: "0f0",
    limegreen: "32cd32",
    linen: "faf0e6",
    magenta: "f0f",
    maroon: "800000",
    mediumaquamarine: "66cdaa",
    mediumblue: "0000cd",
    mediumorchid: "ba55d3",
    mediumpurple: "9370db",
    mediumseagreen: "3cb371",
    mediumslateblue: "7b68ee",
    mediumspringgreen: "00fa9a",
    mediumturquoise: "48d1cc",
    mediumvioletred: "c71585",
    midnightblue: "191970",
    mintcream: "f5fffa",
    mistyrose: "ffe4e1",
    moccasin: "ffe4b5",
    navajowhite: "ffdead",
    navy: "000080",
    oldlace: "fdf5e6",
    olive: "808000",
    olivedrab: "6b8e23",
    orange: "ffa500",
    orangered: "ff4500",
    orchid: "da70d6",
    palegoldenrod: "eee8aa",
    palegreen: "98fb98",
    paleturquoise: "afeeee",
    palevioletred: "db7093",
    papayawhip: "ffefd5",
    peachpuff: "ffdab9",
    peru: "cd853f",
    pink: "ffc0cb",
    plum: "dda0dd",
    powderblue: "b0e0e6",
    purple: "800080",
    red: "f00",
    rosybrown: "bc8f8f",
    royalblue: "4169e1",
    saddlebrown: "8b4513",
    salmon: "fa8072",
    sandybrown: "f4a460",
    seagreen: "2e8b57",
    seashell: "fff5ee",
    sienna: "a0522d",
    silver: "c0c0c0",
    skyblue: "87ceeb",
    slateblue: "6a5acd",
    slategray: "708090",
    slategrey: "708090",
    snow: "fffafa",
    springgreen: "00ff7f",
    steelblue: "4682b4",
    tan: "d2b48c",
    teal: "008080",
    thistle: "d8bfd8",
    tomato: "ff6347",
    turquoise: "40e0d0",
    violet: "ee82ee",
    wheat: "f5deb3",
    white: "fff",
    whitesmoke: "f5f5f5",
    yellow: "ff0",
    yellowgreen: "9acd32"
};

// Make it easy to access colors via `hexNames[hex]`
var hexNames = tinycolor.hexNames = flip(names);


// Utilities
// ---------

// `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
function flip(o) {
    var flipped = { };
    for (var i in o) {
        if (o.hasOwnProperty(i)) {
            flipped[o[i]] = i;
        }
    }
    return flipped;
}

// Return a valid alpha value [0,1] with all invalid values being set to 1
function boundAlpha(a) {
    a = parseFloat(a);

    if (isNaN(a) || a < 0 || a > 1) {
        a = 1;
    }

    return a;
}

// Take input from [0, n] and return it as [0, 1]
function bound01(n, max) {
    if (isOnePointZero(n)) { n = "100%"; }

    var processPercent = isPercentage(n);
    n = mathMin(max, mathMax(0, parseFloat(n)));

    // Automatically convert percentage into number
    if (processPercent) {
        n = parseInt(n * max, 10) / 100;
    }

    // Handle floating point rounding errors
    if ((math.abs(n - max) < 0.000001)) {
        return 1;
    }

    // Convert into [0, 1] range if it isn't already
    return (n % max) / parseFloat(max);
}

// Force a number between 0 and 1
function clamp01(val) {
    return mathMin(1, mathMax(0, val));
}

// Parse a base-16 hex value into a base-10 integer
function parseIntFromHex(val) {
    return parseInt(val, 16);
}

// Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
// <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
function isOnePointZero(n) {
    return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
}

// Check to see if string passed in is a percentage
function isPercentage(n) {
    return typeof n === "string" && n.indexOf('%') != -1;
}

// Force a hex value to have 2 characters
function pad2(c) {
    return c.length == 1 ? '0' + c : '' + c;
}

// Replace a decimal with it's percentage value
function convertToPercentage(n) {
    if (n <= 1) {
        n = (n * 100) + "%";
    }

    return n;
}

// Converts a decimal to a hex value
function convertDecimalToHex(d) {
    return Math.round(parseFloat(d) * 255).toString(16);
}
// Converts a hex value to a decimal
function convertHexToDecimal(h) {
    return (parseIntFromHex(h) / 255);
}

var matchers = (function() {

    // <http://www.w3.org/TR/css3-values/#integers>
    var CSS_INTEGER = "[-\\+]?\\d+%?";

    // <http://www.w3.org/TR/css3-values/#number-value>
    var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

    // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
    var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

    // Actual matching.
    // Parentheses and commas are optional, but not required.
    // Whitespace can take the place of commas or opening paren
    var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
    var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

    return {
        rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
        rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
        hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
        hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
        hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
        hex3: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
        hex8: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
    };
})();

// `stringInputToObject`
// Permissive string parsing.  Take in a number of formats, and output an object
// based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
function stringInputToObject(color) {

    color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
    var named = false;
    if (names[color]) {
        color = names[color];
        named = true;
    }
    else if (color == 'transparent') {
        return { r: 0, g: 0, b: 0, a: 0, format: "name" };
    }

    // Try to match string input using regular expressions.
    // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
    // Just return an object and let the conversion functions handle that.
    // This way the result will be the same whether the tinycolor is initialized with string or object.
    var match;
    if ((match = matchers.rgb.exec(color))) {
        return { r: match[1], g: match[2], b: match[3] };
    }
    if ((match = matchers.rgba.exec(color))) {
        return { r: match[1], g: match[2], b: match[3], a: match[4] };
    }
    if ((match = matchers.hsl.exec(color))) {
        return { h: match[1], s: match[2], l: match[3] };
    }
    if ((match = matchers.hsla.exec(color))) {
        return { h: match[1], s: match[2], l: match[3], a: match[4] };
    }
    if ((match = matchers.hsv.exec(color))) {
        return { h: match[1], s: match[2], v: match[3] };
    }
    if ((match = matchers.hex8.exec(color))) {
        return {
            a: convertHexToDecimal(match[1]),
            r: parseIntFromHex(match[2]),
            g: parseIntFromHex(match[3]),
            b: parseIntFromHex(match[4]),
            format: named ? "name" : "hex8"
        };
    }
    if ((match = matchers.hex6.exec(color))) {
        return {
            r: parseIntFromHex(match[1]),
            g: parseIntFromHex(match[2]),
            b: parseIntFromHex(match[3]),
            format: named ? "name" : "hex"
        };
    }
    if ((match = matchers.hex3.exec(color))) {
        return {
            r: parseIntFromHex(match[1] + '' + match[1]),
            g: parseIntFromHex(match[2] + '' + match[2]),
            b: parseIntFromHex(match[3] + '' + match[3]),
            format: named ? "name" : "hex"
        };
    }

    return false;
}

// Node: Export function
if (typeof module !== "undefined" && module.exports) {
    module.exports = tinycolor;
}
// AMD/requirejs: Define the module
else if (typeof define === 'function' && define.amd) {
    define(function () {return tinycolor;});
}
// Browser: Expose to window
else {
    window.tinycolor = tinycolor;
}

})();

},{}],2:[function(require,module,exports){
/*!
* TinyGradient
* Copyright 2014 Damien "Mistic" Sorel (http://www.strangeplanet.fr)
* Licensed under MIT (http://opensource.org/licenses/MIT)
*/

(function(root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory(require('tinycolor2'));
    }
    else if (typeof define === 'function' && define.amd) {
        define(['tinycolor'], factory);
    }
    else {
        root.tinygradient = factory(root.tinycolor);
    }
}(this, function(tinycolor) {
    "use strict";

    var Utils = {
        rgba_max: { r: 256, g: 256, b: 256, a: 1 },
        hsva_max: { h: 360, s: 1, v: 1, a: 1 },

        /**
         * Linearly compute the step size between start and end (not normalized)
         * @param {Object} start - rgba or hsva
         * @param {Object} end - rgba or hsva
         * @param {Integer} steps - number of desired steps
         * @return {Object} rgba or hsva
         */
        stepize: function(start, end, steps) {
            var step = {};

            for (var k in start) {
                if (start.hasOwnProperty(k)) {
                    step[k] = (end[k]-start[k]) / steps;
                }
            }

            return step;
        },

        /**
         * Compute the final step color
         * @param {Object} step - rgba or hsva from `stepize`
         * @param {Object} start - rgba or hsva
         * @param {Integer} i - color index
         * @param {Object} max - rgba or hsva of maximum values for each channel
         * @return {Object} rgba or hsva
         */
        interpolate: function(step, start, i, max) {
            var color = {};

            for (var k in start) {
                if (start.hasOwnProperty(k)) {
                    color[k] = step[k] * i + start[k];
                    color[k] = color[k]<0 ? color[k]+max[k] : ( max[k]!=1 ? color[k]%max[k] : color[k] );
                }
            }

            return color;
        },

        /**
         * Generate gradient with RGBa interpolation
         * @param {Object} stop1
         * @param {Object} stop2
         * @param {Integer} steps
         * @param {tinycolor[]} color1 included, color2 excluded
         */
        rgb: function(stop1, stop2, steps) {
            var start = stop1.color.toRgb(),
                end = stop2.color.toRgb(),
                gradient = [stop1.color],
                step = Utils.stepize(start, end, steps),
                color;

            for (var i=1; i<steps; i++) {
                color = Utils.interpolate(step, start, i, Utils.rgba_max);
                gradient.push(tinycolor(color));
            }

            return gradient;
        },

        /**
         * Generate gradient with HSVa interpolation
         * @param {Object} stop1
         * @param {Object} stop2
         * @param {Integer} steps
         * @param {Boolean} trigonometric - true to step in trigonometric order
         * @param {tinycolor[]} color1 included, color2 excluded
         */
        hsv: function(stop1, stop2, steps, trigonometric) {
            var start = stop1.color.toHsv(),
                end = stop2.color.toHsv(),
                gradient = [stop1.color],
                step = Utils.stepize(start, end, steps),
                diff, color;

            // recompute hue
            if ((start.h <= end.h && !trigonometric) || (start.h >= end.h && trigonometric)) {
                diff = end.h-start.h;
            }
            else if (trigonometric) {
                diff = 360-end.h+start.h;
            }
            else {
                diff = 360-start.h+end.h;
            }
            step.h = Math.pow(-1, trigonometric) * Math.abs(diff)*1.0 / steps;

            for (var i=1; i<steps; i++) {
                color = Utils.interpolate(step, start, i, Utils.hsva_max);
                gradient.push(tinycolor(color));
            }

            return gradient;
        },

        /**
         * Compute substeps between each stops
         * @param {Object[]} stops
         * @param {Integer} steps
         * @return {Integer[]}
         */
        substeps: function(stops, steps) {
            var l = stops.length;

            // validation
            steps = parseInt(steps);

            if (isNaN(steps) || steps < 2) {
                throw new Error('Invalid number of steps (< 2)');
            }
            if (steps < l) {
                throw new Error('Number of steps cannot be inferior to number of stops');
            }

            // compute substeps from stop positions
            var substeps = [];

            for (var i=1; i<l; i++) {
                var step = (steps-1) * (stops[i].pos-stops[i-1].pos);
                substeps.push(Math.max(1, Math.round(step)));
            }

            // adjust number of steps
            var totalSubsteps = 1;
            for (var n=l-1; n--;) totalSubsteps+= substeps[n];

            while (totalSubsteps != steps) {
                if (totalSubsteps < steps) {
                    var min = Math.min.apply(null, substeps);
                    substeps[substeps.indexOf(min)]++;
                    totalSubsteps++;
                }
                else {
                    var max = Math.max.apply(null, substeps);
                    substeps[substeps.indexOf(max)]--;
                    totalSubsteps--;
                }
            }

            return substeps;
        }
    };

    /**
     * @class tinygradient
     * @param {mixed} stops
     */
    var TinyGradient = function(stops) {
        // varargs
        if (arguments.length == 1) {
            if (!(arguments[0] instanceof Array)) {
                throw new Error('"stops" is not an array');
            }
            stops = arguments[0];
        }
        else {
            stops = Array.prototype.slice.call(arguments);
        }

        // if we are called as a function, call using new instead
        if (!(this instanceof TinyGradient)) {
            return new TinyGradient(stops);
        }

        // validation
        if (stops.length < 2) {
            throw new Error('Invalid number of stops (< 2)');
        }

        var havingPositions = stops[0].pos !== undefined,
            l = stops.length,
            p = -1;
        // create tinycolor objects and clean positions
        this.stops = stops.map(function(stop, i) {
            var hasPosition = stop.pos !== undefined;
            if (havingPositions ^ hasPosition) {
                throw new Error('Cannot mix positionned and not posionned color stops');
            }

            if (hasPosition) {
                stop = {
                    color: tinycolor(stop.color),
                    pos: stop.pos
                };

                if (stop.pos < 0 || stop.pos > 1) {
                    throw new Error('Color stops positions must be between 0 and 1');
                }
                else if (stop.pos <= p) {
                    throw new Error('Color stops positions are not ordered');
                }
                p = stop.pos;
            }
            else {
                stop = {
                    color: tinycolor(stop),
                    pos: i/(l-1)
                };
            }

            return stop;
        });

        if (this.stops[0].pos !== 0) {
            this.stops.unshift({
                color: this.stops[0].color,
                pos: 0
            });
        }
        if (this.stops[this.stops.length-1].pos !== 1) {
            this.stops.push({
                color: this.stops[this.stops.length-1].color,
                pos: 1
            });
        }
    };

    /**
     * Return new instance with reversed stops
     * @return {tinygradient}
     */
    TinyGradient.prototype.reverse = function() {
        var stops = [];

        this.stops.forEach(function(stop) {
            stops.push({
                color: stop.color,
                pos: 1 - stop.pos
            });
        });

        return new TinyGradient(stops.reverse());
    };

    /**
     * Generate gradient with RGBa interpolation
     * @param {Integer} steps
     * @return {tinycolor[]}
     */
    TinyGradient.prototype.rgb = function(steps) {
        var substeps = Utils.substeps(this.stops, steps),
            gradient = [];

        for (var i=0, l=this.stops.length; i<l-1; i++) {
            gradient = gradient.concat(Utils.rgb(this.stops[i], this.stops[i+1], substeps[i]));
        }

        gradient.push(this.stops[l-1].color);

        return gradient;
    };

    /**
     * Generate gradient with HSVa interpolation
     * @param {Integer} steps
     * @param {Boolean|String} [mode=false]
     *    - false to step in clockwise
     *    - true to step in trigonometric order
     *    - 'short' to use the shortest way
     *    - 'long' to use the longest way
     * @return {tinycolor[]}
     */
    TinyGradient.prototype.hsv = function(steps, mode) {
        var substeps = Utils.substeps(this.stops, steps),
            trigonometric = mode === true,
            parametrized = typeof mode === 'string',
            gradient = [],
            start, end, trig;

        for (var i=0, l=this.stops.length; i<l-1; i++) {
            start = this.stops[i].color.toHsv();
            end = this.stops[i+1].color.toHsv();
                
            if (parametrized) {
                trig = (start.h < end.h && end.h-start.h < 180) || (start.h > end.h && start.h-end.h > 180);
            }
            
            // rgb interpolation if one of the steps in grayscale
            if (start.s===0 || end.s===0) {
                gradient = gradient.concat(Utils.rgb(this.stops[i], this.stops[i+1], substeps[i]));
            }
            else {
                gradient = gradient.concat(Utils.hsv(this.stops[i], this.stops[i+1], substeps[i],
                  (mode==='long' && trig) || (mode==='short' && !trig) || (!parametrized && trigonometric)
                ));
            }
        }

        gradient.push(this.stops[l-1].color);

        return gradient;
    };

    /**
     * Generate CSS3 command (no prefix) for this gradient
     * @param {String} [mode=linear] - 'linear' or 'radial'
     * @param {String} [direction] - default is 'to right' or 'ellipse at center'
     * @return {String}
     */
    TinyGradient.prototype.css = function(mode, direction) {
        mode = mode || 'linear';
        direction = direction || (mode=='linear' ? 'to right' : 'ellipse at center');

        var css = mode + '-gradient(' + direction;
        this.stops.forEach(function(stop) {
            css+= ', ' + stop.color.toRgbString() + ' ' + (stop.pos*100) + '%';
        });
        css+= ')';
        return css;
    };


    /**
     * Initialize and create gradient with RGBa interpolation
     * @see TinyGradient::rgb
     */
    TinyGradient.rgb = function(colors, steps) {
        colors = Array.prototype.slice.call(arguments);
        steps = colors.pop();

        return TinyGradient.apply(null, colors).rgb(steps);
    };

    /**
     * Initialize and create gradient with HSVa interpolation
     * @see TinyGradient::hsv
     */
    TinyGradient.hsv = function(colors, steps, mode) {
        colors = Array.prototype.slice.call(arguments);
        mode = colors.pop();
        steps = colors.pop();

        return TinyGradient.apply(null, colors).hsv(steps, mode);
    };

    /**
     * Initialize and generate CSS3 command for gradient
     * @see TinyGradient::css
     */
    TinyGradient.css = function(colors, mode, direction) {
        colors = Array.prototype.slice.call(arguments);
        direction = colors.pop();
        mode = colors.pop();

        return TinyGradient.apply(null, colors).css(mode, direction);
    };


    // export
    return TinyGradient;
}));
},{"tinycolor2":1}],3:[function(require,module,exports){
var Profiler = require('./profiler');

var App = {
  generate_threaded: function(m) {
    var num_bins = m.num_threads || 1;

    var len = m.num_pixels;
    var bin_size = Math.ceil(len / num_bins);

    var cut_points = [];
    for (var i = 0; i < len; i += bin_size) {
      cut_points.push([i, i + bin_size]);
    }

    var t1, t2;
    return Promise.resolve()
      .then(function(data) {
        m.C = data;

        t1 = Number(new Date());
        return App.run_generate_worker(m, cut_points);
      })
      .then(function(data) {
        t2 = Number(new Date());
        var ttime = (t2 - t1);
        var ttotal = (ttime / 1000)
        console.log("ttotal generate: " + ttotal);

        return data;
      })
    ;
  },

  run_generate_worker: function(m, cut_points) {
    var num_iter = m.num_iter || 10;
    var num_pixels = m.num_pixels || 10;

    var workerTasks = cut_points.map(function(cp) {
      return new Promise(function(resolve, reject) {
        var myWorker = new Worker('assets/worker_generate.js');

        myWorker.onmessage = resolve;

        myWorker.postMessage({
          y_min: cp[0],
          y_max: cp[1],
          num_iter: num_iter,
          num_pixels: num_pixels,
          gradient_def: m.gradient_def,
          gradient_profile: m.gradient_profile,
          gradient_counter_clockwise: m.gradient_counter_clockwise,
          edge_left: m.edge_left,
          edge_right: m.edge_right,
          edge_top: m.edge_top,
          edge_bottom: m.edge_bottom,
        });
      });
    });

    var resultPromise = Promise.all(workerTasks).then(function(messages) {
      var length = num_pixels * num_pixels * 4;
      var imageData = new Uint8ClampedArray(length);

      var i = 0;
      messages.reverse().forEach(function(e, section) {
        var arr = new Uint8ClampedArray(e.data);
        var n = arr.length;

        for (var j = 0; j < n; j++) {
          imageData[i++] = arr[j];
        }
      });

      imageData.length

      return imageData;
    });

    return resultPromise;
  },
};

module.exports = App;

},{"./profiler":10}],4:[function(require,module,exports){
var Complex = require('./complex_header');
var Imaginary = require('./imaginary_array');

Complex.eq = (A, B) => {
  return (
    A[0] === B[0] &&
    A[1] === B[1]
  );
};

////////////////////////////////////////////////////////////
// Addition
////////////////////////////////////////////////////////////
Complex.addReal = (z, r) => {
  return [z[0] + r, z[1]];
};

Complex.addImaginary = (z, j) => {
  return [z[0], Imaginary.addImaginary(z[1], j)];
};

Complex.addComplex = (A, B) => {
  return [A[0] + B[0], Imaginary.addImaginary(A[1], B[1])];
};

////////////////////////////////////////////////////////////
// Subtraction
////////////////////////////////////////////////////////////
Complex.subReal = (z, r) => {
  return [z[0] - r, z[1]];
};

Complex.subRealInverse = (z, r) => {
  return [r - z[0], Imaginary.mulReal(z[1], -1)];
};

Complex.subImaginary = (z, j) => {
  return [z[0], Imaginary.addImaginary(z[1], Imaginary.mulReal(j, -1))];
};

Complex.subImaginaryInverse = (z, j) => {
  return [-1 * z[0], Imaginary.addImaginary(j, Imaginary.mulReal(z[1], -1))];
};

Complex.subComplex = (A, B) => {
  var C = [B[0] * -1, Imaginary.mulReal(B[1], -1)]
  return Complex.addComplex(A, C);
};

////////////////////////////////////////////////////////////
// Multiplication
////////////////////////////////////////////////////////////
Complex.mulReal = (z, r) => {
  return [z[0]*r, Imaginary.mulReal(z[1], r)];
};

Complex.mulImaginary = (z, j) => {
  return [Imaginary.mulImaginary(z[1], j), z[0]*j];
};

Complex.mulComplex = (A, B) => {
  var z1 = Complex.mulReal(B, A[0]);
  var z2 = Complex.mulImaginary(B, A[1]);

  return Complex.addComplex(z1, z2);
};

////////////////////////////////////////////////////////////
// Conjugates
////////////////////////////////////////////////////////////
Complex.getConjugate = (z) => {
  return [z[0], Imaginary.mulReal(z[1], -1)];
};

Complex.getConjugateMultiple = (z) => {
  return Complex.mulComplex(z, Complex.getConjugate(z));
};

Complex.getConjugateSimplified = (z) => {
  var Z = Complex.getConjugateMultiple(z);
  return Z[0];
};

////////////////////////////////////////////////////////////
// Division
////////////////////////////////////////////////////////////
Complex.divReal = (z, r) => {
  return [z[0] / r, Imaginary.divReal(z[1], r)];
};

Complex.divRealInverse = (z, r) => {
  var R = [r, 0];

  return Complex.divComplex(R, z);
};

Complex.divImaginary = (z, j) => {
  return Complex.divComplex(z, [0, j]);
};

Complex.divImaginaryInverse = (z, j) => {
  var I = [0, j];

  return Complex.divComplex(I, z);
};

Complex.divComplex = (A, B) => {
  var C = Complex.getConjugate(B);

  var Z = Complex.mulComplex(A, C);
  var RZ = Complex.mulComplex(B, C);

  var r = RZ[0];

  return [Z[0] / r, Imaginary.divReal(Z[1], r)];
};

module.exports = Complex;

},{"./complex_header":5,"./imaginary_array":6}],5:[function(require,module,exports){
var Complex = {
  addReal: (z, r) => 0.0,
  addImaginary: (z, j) => 0.0,
  addComplex: (z, z0) => 0.0,
  subReal: (z, r) => 0.0,
  subImaginary: (z, j) => 0.0,
  subComplex: (z, z0) => 0.0,
  subRealInverse: (z, r) => 0.0,
  subImaginaryInverse: (z, j) => 0.0,
  subComplexInverse: (z, z0) => 0.0,
  mulReal: (z, r) => 0.0,
  mulImaginary: (z, j) => 0.0,
  mulComplex: (z, z0) => 0.0,
  divReal: (z, r) => 0.0,
  divImaginary: (z, j) => 0.0,
  divComplex: (z, z0) => 0.0,
  divRealInverse: (z, r) => 0.0,
  divImaginaryInverse: (z, j) => 0.0,
  divComplexInverse: (z, z0) => 0.0,

  eq: (z, z0) => 0.0,
  neq: (z, z0) => 0.0,
};

module.exports = Complex;

},{}],6:[function(require,module,exports){
var Imaginary = require('./imaginary_header');

Imaginary.addImaginary = (j, j0) => {
  return j + j0;
};

Imaginary.addReal = (j, r) => {
  return [r, j];
};

Imaginary.subImaginary = (j, j0) => {
  return j - j0;
};

Imaginary.subReal = (j, r) => {
  return [0 - r, j];
};

Imaginary.subRealInverse = (j, r) => {
  return [r, 0 - j];
};

Imaginary.subReal = (j, r) => {
  return [0 - r, j];
};

Imaginary.mulImaginary = (j, j0) => {
  return j * j0 * -1;
};

Imaginary.mulReal = (j, r) => {
  return j * r;
};

Imaginary.divImaginary = (j, j0) => {
  var conjugate = 0 - j0;

  // (3i / 4i)
  // (3i*-4i / 4i * -4i)
  // (-12i^2 / -16i^2)
  // (12 / -16)
  var numerator = Imaginary.mulImaginary(j, conjugate);
  var denominator = Imaginary.mulImaginary(j0, conjugate);

  // numerator is real
  // denominator is now real
  return numerator / denominator;
};

Imaginary.divReal = (j, r) => {
  return j / r;
};

// returns imaginary
Imaginary.divRealInverse = (j, r) => {
  var conjugate = 0 - j;

  var numerator = Imaginary.mulReal(conjugate, r);
  var denominator = Imaginary.mulImaginary(conjugate, j);

  // numerator is now imaginary
  // denominator is now real
  return numerator / denominator;
};

module.exports = Imaginary;

},{"./imaginary_header":7}],7:[function(require,module,exports){
var Imaginary = {
  addImaginary: (j, j0) => 0.0,
  addReal: (j, r) => 0.0,
  subImaginary: (j, j0) => 0.0,
  subReal: (j, r) => 0.0,
  subFromReal: (j, r) => 0.0,
  mulImaginary: (j, j0) => 0.0,
  mulReal: (j, r) => 0.0,
  divImaginary: (j, j0) => 0.0,
  divReal: (j, r) => 0.0,
  divRealInverse: (j, r) => 0.0,

  eq: (j, j0) => 0.0,
  neq: (j, j0) => 0.0,
  gt: (j, j0) => 0.0,
  lt: (j, j0) => 0.0,
  gte: (j, j0) => 0.0,
  lte: (j, j0) => 0.0,
};

module.exports = Imaginary;

},{}],8:[function(require,module,exports){
var Ui = require('./ui');
var Mandle = require('./mandle');

disclaimer();

var canvas = document.getElementById('canvas');
var m = Mandle.init_mandle_config(canvas);

function disclaimer() {
  var $d = $('#disclaimer');

  $d.on('hidden.bs.modal', function (e) {
  });

  $('.js-disclaimer-ok').on('click', function(e) {
    Ui.bind_events(m);
    Ui.onRender(m);

    $d.modal('hide');
  });

  $('.js-disclaimer-cancel').on('click', function(e) {
    window.location.href = 'http://www.rocksolidwebdesign.com/';
  });

  $d.modal();
}

},{"./mandle":9,"./ui":12}],9:[function(require,module,exports){
var tinygradient = require('tinygradient');
var Complex = require('./complex_array');
var Profiler = require('./profiler');

var Mandle = {
  render_canvas: function(m, data) {
    if (m.is_dirty) {
      Mandle.sync_mandle_config(m);
      m.is_dirty = false;
    }

    return Profiler.task("render", function() {
      return Mandle.render(data, m.num_pixels, m.num_iter, m.ctx);
    });
  },

  get_complex_plane: function(m) {
    return Profiler.task("complex_plane", function() {
      return Mandle.complex_plane(m.num_pixels);
    });
  },

  process_subset: function(m) {
    var v = Mandle.get_generated_values(m);
    return Mandle.get_colorized_values(m, v);
  },

  get_colorized_values: function(m, v) {
    return Profiler.task("colorize", function() {
      return Mandle.colorize(v, m.num_pixels, m.num_iter, m.gradient_def, m.gradient_profile, m.gradient_counter_clockwise);
    });
  },

  //get_generated_values: function(m) {
  //  return Profiler.task("generate", function() {
  //    return Mandle.generate(m.center_x, m.center_y, m.pixel_size, m.num_pixels, m.num_iter);
  //  });
  //},

  //generate: function(center_x, center_y, pixel_spacing, num_pixels, num_iter, num_jobs, job_id) {
  //},

  get_generated_values: function(m) {
    return Profiler.task("generate", function() {
      return Mandle.generate(m.y_min, m.y_max, m.num_pixels, m.num_iter, m.edge_left, m.edge_right, m.edge_top, m.edge_bottom);
    });
  },

  generate: function(y_coord_min, y_coord_max, num_pixels, num_iter, edge_left, edge_right, edge_top, edge_bottom) {
    var num_rows = y_coord_max - y_coord_min;
    var len = num_rows * num_pixels;

    var M = new Float64Array(len);

    var dist = edge_top - edge_bottom;
    //var step = (4) / num_pixels;
    var step = (dist) / num_pixels;

    var i = 0;
    for (var y_coord = y_coord_max; y_coord > y_coord_min; y_coord -= 1) {
      var y_val = edge_top - (y_coord * step);
      for (var x_coord = 0; x_coord < num_pixels; x_coord += 1) {
        var x_val = edge_left + (x_coord * step);

        var c = [x_val, y_val];

        var num_steps = Mandle.iterate(c, num_iter);

        M[i] = num_steps;
        i++;
      }
    }

    return M;
  },

  gradient_factory: function(gradient_def, num_iter, gradient_profile, gradient_counter_clockwise) {
    var gradient = tinygradient.apply(tinygradient, gradient_def);
    return gradient[gradient_profile](num_iter + 1, !gradient_counter_clockwise);
  },

  colorize: function(M, num_pixels, num_iter, gradient_def, gradient_profile, gradient_counter_clockwise) {
    var MM = new Uint8ClampedArray(M.length * 4);
    var g = Mandle.gradient_factory(gradient_def, num_iter, gradient_profile, gradient_counter_clockwise);

    var vals = {};

    var offset = num_pixels / 2;
    var heat_value = "";
    var val, x, y;

    var strength = 1;
    var level = 50 * strength;
    var percent = (30 + level) / 100;
    var hex = (255 * percent).toFixed(0);
    var pixel_color;

    var len = MM.length;
    for (x = 0; x < len; x += 4) {
      val = M[x / 4];

      if (val <= 0) {
        MM[x]   = 0;
        MM[x+1] = 0;
        MM[x+2] = 0;
        MM[x+3] = 255;
      }
      else {
        pixel_color = g[val];

        if (pixel_color && typeof pixel_color.toHex === 'function') {
          strength = val / num_iter;
          level = 50 * strength;
          percent = (30 + level) / 100;
          hex = (255 * percent).toFixed(0);

          MM[x]   = pixel_color._r;
          MM[x+1] = pixel_color._g;
          MM[x+2] = pixel_color._b;
          MM[x+3] = 255;
        }
        else {
          MM[x]   = 255;
          MM[x+1] = 255;
          MM[x+2] = 255;
          MM[x+3] = 255;
        }
      }
    }

    return MM;
  },

  render: function(M, num_pixels, num_iter, ctx) {
    var img = new ImageData(M,num_pixels,num_pixels);
    ctx.putImageData(img, 0, 0);
    //ctx.putImageData(img, 0, 0, 0, 0, num_pixels, num_pixels);
  },

  render_mandlebrot_ascii: function(M, num_pixels) {
    result = "";

    for (var y = 0; y < num_pixels; y++) {
      result += "M: ";
      for (var x = 0; x < num_pixels; x++) {
        if (M[y*num_pixels+x] == 0.0) {
          result += " ";
        }
        else {
          result += M[y*num_pixels+x];
        }
      }
      result += '\n';
    }
    result += '\n';

    return result;
  },

  iterate: function(c, num_iter) {
    var result = [0, 0];

    var steps_out = 0;
    for (var i = 0; i < num_iter; i++) {
      result = Mandle.f_of_c(result, c);

      var is_out = (
        result[0] > 2.0 ||
        result[1] > 2.0 ||
        result[0] < -2.0 ||
        result[1] < -2.0
      );

      if (is_out) {
        steps_out = i + 1;
        break;
      }
    }

    return steps_out;
  },

  //https://randomascii.wordpress.com/2011/08/13/faster-fractals-through-algebra/
  // z.r = 0;
  // z.i = 0;
  // zrsqr = z.r * z.r;
  // zisqr = z.i * z.i;
  // while (zrsqr + zisqr < 4.0)
  // {
  //     z.i = z.r * z.i;
  //     z.i += z.i; // Multiply by two
  //     z.i += c.i;
  //     z.r = zrsqr – zisqr + c.r;
  //     zrsqr = square(z.r);
  //     zisqr = square(z.i);
  // }
  //
  //iterate: function(c, num_iter) {
  //  z_r = c[0];
  //  z_i = c[1];

  //  zrsqr = z_r * z_r;
  //  zisqr = z_i * z_i;

  //  while (zrsqr + zisqr < 2)
  //  {
  //      z_i = z_r * z_i;
  //      z_i += z_i; // Multiply by two
  //      z_i += c_i;
  //      z_r = zrsqr - zisqr + c_r;
  //      zrsqr = square(z_r);
  //      zisqr = square(z_i);
  //  }
  //},

  f_of_c: function(z, c) {
    return Complex.addComplex(Complex.mulComplex(z, z), c);
  },

  init_mandle_config: function(canvas) {
    var ctx = canvas.getContext('2d');

    var num_threads = 1;
    var num_iter = 50;
    var num_pixels = 100;

    //var gradient_def = [
    //  {color: 'blue', pos: 0},
    //  {color: 'yellow', pos: 1},
    //];

    var gradient_def = [
      '#ff0000',
      '#ff9f00',
      '#ffff00',
      '#9fff00',
      '#00ff00',
      '#00ff9f',
      '#00ffff',
      '#009fff',
      '#0000ff',
      '#9f00ff',
      '#ff00ff',
      '#ff009f',
    ];

    var gradient_profile = 'hsv';
    var gradient_counter_clockwise = false;

    var m = {
      canvas: canvas,
      ctx: ctx,
      num_iter: num_iter,
      num_threads: num_threads,
      num_pixels: num_pixels,
      gradient_def: gradient_def,
      gradient_counter_clockwise: gradient_counter_clockwise,
      gradient_profile: gradient_profile,
      zoom_level: 1,
      zoom_display: 1,
      radius: 2,
      edge_left: -2,
      edge_right: 2,
      edge_top: 2,
      edge_bottom: -2,
    };

    Mandle.sync_mandle_config(m);

    return m;
  },

  sync_mandle_config: function(m) {
    m.canvas.setAttribute('width', m.num_pixels);
    m.canvas.setAttribute('height', m.num_pixels);
  },
};

module.exports = Mandle;

},{"./complex_array":4,"./profiler":10,"tinygradient":2}],10:[function(require,module,exports){
function report_profiling(start, end, msg) {
  var total = ((end - start) / 1000).toFixed(3);

  console.log("  END [" + total + "s] " + msg);
}

function measure_time_for_task(desc, f) {
  console.log("BEGIN [0.000s] " + desc);

  var t1 = Number(new Date());
  var result = f();
  var t2 = Number(new Date());
  report_profiling(t1, t2, desc);
  return result;
}

module.exports = {
  task: measure_time_for_task,
};

},{}],11:[function(require,module,exports){
var default_spinner_opts = {
    lines: 13 // The number of lines to draw
      , length: 5 // The length of each line
      , width: 2 // The line thickness
      , radius: 5 // The radius of the inner circle
      , scale: 1 // Scales overall size of the spinner
      , corners: 1 // Corner roundness (0..1)
      , color: '#777777' // #rgb or #rrggbb or array of colors
      , opacity: 0.25 // Opacity of the lines
      , rotate: 0 // The rotation offset
      , direction: 1 // 1: clockwise, -1: counterclockwise
      , speed: 1 // Rounds per second
      , trail: 60 // Afterglow percentage
      , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
      , zIndex: 3e9 // The z-index (defaults to 2000000000)
      , className: 'spinner' // The CSS class to assign to the spinner
      , top: '50%' // Top position relative to parent
      , left: '50%' // Left position relative to parent
      , shadow: false // Whether to render a shadow
      , hwaccel: false // Whether to use hardware acceleration
      , position: 'relative' // Element positioning
};

function S(el, opts) {
  this.el = el || document.getElementById('spinner');
  this.opts = opts || default_spinner_opts;
  this.spinner = new Spinner(this.opts);
}

S.prototype = {
  hide: function() {
    this.spinner.stop();
    //$(el).addClass('hide');
  },

  show: function() {
    this.spinner.spin();
    this.el.appendChild(this.spinner.el);
    //$(el).removeClass('hide');
  }
}

module.exports = S;

},{}],12:[function(require,module,exports){
var Throbber = require('./spinner');
var App = require('./app');
var Mandle = require('./mandle');

function onRender(m) {
  if (m.is_rendering) {
    return false;
  }

  var throbEl = document.getElementById('render_spinner');
  var throb = new Throbber(throbEl);
  throb.show();

  m.is_rendering = true;
  App.generate_threaded(m).then(function(data) {
    Mandle.render_canvas(m, data);
    m.is_rendering = false;
    throb.hide();
  });
}

function onChangeProfile(m, e) {
  var val = $(e.currentTarget).val();

  m.gradient_profile = val;

  m.is_dirty = true;
}

function onChangeClockwise(m, e) {
  var val = $(e.currentTarget).val();

  if (val === 'counter_clockwise') {
    m.gradient_counter_clockwise = true;
  }
  else {
    m.gradient_counter_clockwise = false;
  }

  m.is_dirty = true;
}

function onChangePixels(m, e) {
  var val = $(e.currentTarget).val();

  if (val.match(/^[0-9]+$/) && !isNaN(val)) {
    m.num_pixels = Number(val);

    m.is_dirty = true;
  }
}

function onChangeMove(m, e) {
  if (m.is_rendering) {
    return false;
  }

  var direction = $(e.currentTarget).data('move');

  var dist = (m.edge_top - m.edge_bottom) * 0.1;
  if (direction === 'n') {
    m.edge_top -= dist;
    m.edge_bottom -= dist;
  }
  else if (direction === 's') {
    m.edge_top += dist;
    m.edge_bottom += dist;
  }
  else if (direction === 'e') {
    m.edge_left += dist;
    m.edge_right += dist;
  }
  else if (direction === 'w') {
    m.edge_left -= dist;
    m.edge_right -= dist;
  }

  onRender(m);
}

function onChangeZoom(m, e) {
  var direction = $(e.currentTarget).data('zoom');

  if (m.is_rendering) {
    return false;
  }

  var zoomDist = 0.1;
  var dist = (m.edge_top - m.edge_bottom) * zoomDist;

  if (direction === 'in') {
    if (m.zoom_display + zoomDist > 15.05) {
      return;
    }

    m.zoom_level -= zoomDist;
    m.zoom_display += zoomDist;

    m.edge_top -= dist;
    m.edge_bottom += dist;
    m.edge_left += dist;
    m.edge_right -= dist;
  }
  else if (direction === 'out') {
    if (m.zoom_display - zoomDist < 0.5) {
      return;
    }

    m.zoom_level += zoomDist;
    m.zoom_display -= zoomDist;

    m.edge_top += dist;
    m.edge_bottom -= dist;
    m.edge_left -= dist;
    m.edge_right += dist;
  }

  var zoomPercent = (m.zoom_display * 100);
  var displayLevel = zoomPercent.toFixed(0) + '%';

  $('.js-zoom-display').val(displayLevel);

  onRender(m);
}

function onChangeIterations(m, e) {
  var val = $(e.currentTarget).val();

  var saneVal = val.replace(/[^0-9]/, '').slice(0,3);

  if (!isNaN(saneVal)) {
    var realVal = Number(saneVal);
    if (realVal < 10) {
      realVal = 10;
    }

    m.num_iter = realVal;
  }
  else {
    m.num_iter = 50;
  }

  $('.js-input-iterations').val(m.num_iter);

  m.is_dirty = true;
}

function onChangeNumThreads(m, e) {
  var val = $(e.currentTarget).val();

  if (val.match(/^[0-9]+$/) && !isNaN(val)) {
    m.num_threads = Number(val);
    m.is_dirty = true;
  }
}

function bind_events(m) {
  $('form').on('submit', function(e) {
    console.log("abort");
    e.preventDefault();
    return false;
  });

  $('.js-render-btn').on('click', function(e) {
    e.preventDefault();

    onRender(m);

    return false;
  });

  $('.js-input-pixels').on('change', function(e) {
    e.preventDefault();

    onChangePixels(m, e);

    return false;
  });

  $('.js-input-iterations').on('change', function(e) {
    e.preventDefault();

    onChangeIterations(m, e);

    return false;
  });

  $('.js-input-num-threads').on('change', function(e) {
    e.preventDefault();

    onChangeNumThreads(m, e);

    return false;
  });

  $('.js-input-move').on('click', function(e) {
    e.preventDefault();

    onChangeMove(m, e);

    return false;
  });

  $('.js-input-zoom').on('click', function(e) {
    e.preventDefault();

    onChangeZoom(m, e);

    return false;
  });

  $('.js-input-clockwise').on('change', function(e) {
    e.preventDefault();

    onChangeClockwise(m, e);

    return false;
  });
}

module.exports = {
  bind_events: bind_events,
  onRender: onRender,
};

},{"./app":3,"./mandle":9,"./spinner":11}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvdGlueWNvbG9yMi90aW55Y29sb3IuanMiLCJub2RlX21vZHVsZXMvdGlueWdyYWRpZW50L3RpbnlncmFkaWVudC5qcyIsInNyYy9hcHAuanMiLCJzcmMvY29tcGxleF9hcnJheS5qcyIsInNyYy9jb21wbGV4X2hlYWRlci5qcyIsInNyYy9pbWFnaW5hcnlfYXJyYXkuanMiLCJzcmMvaW1hZ2luYXJ5X2hlYWRlci5qcyIsInNyYy9tYWluLmpzIiwic3JjL21hbmRsZS5qcyIsInNyYy9wcm9maWxlci5qcyIsInNyYy9zcGlubmVyLmpzIiwic3JjL3VpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbmxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIFRpbnlDb2xvciB2MS4wLjBcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iZ3JpbnMvVGlueUNvbG9yXG4vLyBCcmlhbiBHcmluc3RlYWQsIE1JVCBMaWNlbnNlXG5cbihmdW5jdGlvbigpIHtcblxudmFyIHRyaW1MZWZ0ID0gL15bXFxzLCNdKy8sXG4gICAgdHJpbVJpZ2h0ID0gL1xccyskLyxcbiAgICB0aW55Q291bnRlciA9IDAsXG4gICAgbWF0aCA9IE1hdGgsXG4gICAgbWF0aFJvdW5kID0gbWF0aC5yb3VuZCxcbiAgICBtYXRoTWluID0gbWF0aC5taW4sXG4gICAgbWF0aE1heCA9IG1hdGgubWF4LFxuICAgIG1hdGhSYW5kb20gPSBtYXRoLnJhbmRvbTtcblxudmFyIHRpbnljb2xvciA9IGZ1bmN0aW9uIHRpbnljb2xvciAoY29sb3IsIG9wdHMpIHtcblxuICAgIGNvbG9yID0gKGNvbG9yKSA/IGNvbG9yIDogJyc7XG4gICAgb3B0cyA9IG9wdHMgfHwgeyB9O1xuXG4gICAgLy8gSWYgaW5wdXQgaXMgYWxyZWFkeSBhIHRpbnljb2xvciwgcmV0dXJuIGl0c2VsZlxuICAgIGlmIChjb2xvciBpbnN0YW5jZW9mIHRpbnljb2xvcikge1xuICAgICAgIHJldHVybiBjb2xvcjtcbiAgICB9XG4gICAgLy8gSWYgd2UgYXJlIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLCBjYWxsIHVzaW5nIG5ldyBpbnN0ZWFkXG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIHRpbnljb2xvcikpIHtcbiAgICAgICAgcmV0dXJuIG5ldyB0aW55Y29sb3IoY29sb3IsIG9wdHMpO1xuICAgIH1cblxuICAgIHZhciByZ2IgPSBpbnB1dFRvUkdCKGNvbG9yKTtcbiAgICB0aGlzLl9yID0gcmdiLnIsXG4gICAgdGhpcy5fZyA9IHJnYi5nLFxuICAgIHRoaXMuX2IgPSByZ2IuYixcbiAgICB0aGlzLl9hID0gcmdiLmEsXG4gICAgdGhpcy5fcm91bmRBID0gbWF0aFJvdW5kKDEwMCp0aGlzLl9hKSAvIDEwMCxcbiAgICB0aGlzLl9mb3JtYXQgPSBvcHRzLmZvcm1hdCB8fCByZ2IuZm9ybWF0O1xuICAgIHRoaXMuX2dyYWRpZW50VHlwZSA9IG9wdHMuZ3JhZGllbnRUeXBlO1xuXG4gICAgLy8gRG9uJ3QgbGV0IHRoZSByYW5nZSBvZiBbMCwyNTVdIGNvbWUgYmFjayBpbiBbMCwxXS5cbiAgICAvLyBQb3RlbnRpYWxseSBsb3NlIGEgbGl0dGxlIGJpdCBvZiBwcmVjaXNpb24gaGVyZSwgYnV0IHdpbGwgZml4IGlzc3VlcyB3aGVyZVxuICAgIC8vIC41IGdldHMgaW50ZXJwcmV0ZWQgYXMgaGFsZiBvZiB0aGUgdG90YWwsIGluc3RlYWQgb2YgaGFsZiBvZiAxXG4gICAgLy8gSWYgaXQgd2FzIHN1cHBvc2VkIHRvIGJlIDEyOCwgdGhpcyB3YXMgYWxyZWFkeSB0YWtlbiBjYXJlIG9mIGJ5IGBpbnB1dFRvUmdiYFxuICAgIGlmICh0aGlzLl9yIDwgMSkgeyB0aGlzLl9yID0gbWF0aFJvdW5kKHRoaXMuX3IpOyB9XG4gICAgaWYgKHRoaXMuX2cgPCAxKSB7IHRoaXMuX2cgPSBtYXRoUm91bmQodGhpcy5fZyk7IH1cbiAgICBpZiAodGhpcy5fYiA8IDEpIHsgdGhpcy5fYiA9IG1hdGhSb3VuZCh0aGlzLl9iKTsgfVxuXG4gICAgdGhpcy5fb2sgPSByZ2Iub2s7XG4gICAgdGhpcy5fdGNfaWQgPSB0aW55Q291bnRlcisrO1xufTtcblxudGlueWNvbG9yLnByb3RvdHlwZSA9IHtcbiAgICBpc0Rhcms6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRCcmlnaHRuZXNzKCkgPCAxMjg7XG4gICAgfSxcbiAgICBpc0xpZ2h0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmlzRGFyaygpO1xuICAgIH0sXG4gICAgaXNWYWxpZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vaztcbiAgICB9LFxuICAgIGdldEZvcm1hdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mb3JtYXQ7XG4gICAgfSxcbiAgICBnZXRBbHBoYTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hO1xuICAgIH0sXG4gICAgZ2V0QnJpZ2h0bmVzczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZ2IgPSB0aGlzLnRvUmdiKCk7XG4gICAgICAgIHJldHVybiAocmdiLnIgKiAyOTkgKyByZ2IuZyAqIDU4NyArIHJnYi5iICogMTE0KSAvIDEwMDA7XG4gICAgfSxcbiAgICBzZXRBbHBoYTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdGhpcy5fYSA9IGJvdW5kQWxwaGEodmFsdWUpO1xuICAgICAgICB0aGlzLl9yb3VuZEEgPSBtYXRoUm91bmQoMTAwKnRoaXMuX2EpIC8gMTAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuICAgIHRvSHN2OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhzdiA9IHJnYlRvSHN2KHRoaXMuX3IsIHRoaXMuX2csIHRoaXMuX2IpO1xuICAgICAgICByZXR1cm4geyBoOiBoc3YuaCAqIDM2MCwgczogaHN2LnMsIHY6IGhzdi52LCBhOiB0aGlzLl9hIH07XG4gICAgfSxcbiAgICB0b0hzdlN0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoc3YgPSByZ2JUb0hzdih0aGlzLl9yLCB0aGlzLl9nLCB0aGlzLl9iKTtcbiAgICAgICAgdmFyIGggPSBtYXRoUm91bmQoaHN2LmggKiAzNjApLCBzID0gbWF0aFJvdW5kKGhzdi5zICogMTAwKSwgdiA9IG1hdGhSb3VuZChoc3YudiAqIDEwMCk7XG4gICAgICAgIHJldHVybiAodGhpcy5fYSA9PSAxKSA/XG4gICAgICAgICAgXCJoc3YoXCIgICsgaCArIFwiLCBcIiArIHMgKyBcIiUsIFwiICsgdiArIFwiJSlcIiA6XG4gICAgICAgICAgXCJoc3ZhKFwiICsgaCArIFwiLCBcIiArIHMgKyBcIiUsIFwiICsgdiArIFwiJSwgXCIrIHRoaXMuX3JvdW5kQSArIFwiKVwiO1xuICAgIH0sXG4gICAgdG9Ic2w6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaHNsID0gcmdiVG9Ic2wodGhpcy5fciwgdGhpcy5fZywgdGhpcy5fYik7XG4gICAgICAgIHJldHVybiB7IGg6IGhzbC5oICogMzYwLCBzOiBoc2wucywgbDogaHNsLmwsIGE6IHRoaXMuX2EgfTtcbiAgICB9LFxuICAgIHRvSHNsU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhzbCA9IHJnYlRvSHNsKHRoaXMuX3IsIHRoaXMuX2csIHRoaXMuX2IpO1xuICAgICAgICB2YXIgaCA9IG1hdGhSb3VuZChoc2wuaCAqIDM2MCksIHMgPSBtYXRoUm91bmQoaHNsLnMgKiAxMDApLCBsID0gbWF0aFJvdW5kKGhzbC5sICogMTAwKTtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9hID09IDEpID9cbiAgICAgICAgICBcImhzbChcIiAgKyBoICsgXCIsIFwiICsgcyArIFwiJSwgXCIgKyBsICsgXCIlKVwiIDpcbiAgICAgICAgICBcImhzbGEoXCIgKyBoICsgXCIsIFwiICsgcyArIFwiJSwgXCIgKyBsICsgXCIlLCBcIisgdGhpcy5fcm91bmRBICsgXCIpXCI7XG4gICAgfSxcbiAgICB0b0hleDogZnVuY3Rpb24oYWxsb3czQ2hhcikge1xuICAgICAgICByZXR1cm4gcmdiVG9IZXgodGhpcy5fciwgdGhpcy5fZywgdGhpcy5fYiwgYWxsb3czQ2hhcik7XG4gICAgfSxcbiAgICB0b0hleFN0cmluZzogZnVuY3Rpb24oYWxsb3czQ2hhcikge1xuICAgICAgICByZXR1cm4gJyMnICsgdGhpcy50b0hleChhbGxvdzNDaGFyKTtcbiAgICB9LFxuICAgIHRvSGV4ODogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiByZ2JhVG9IZXgodGhpcy5fciwgdGhpcy5fZywgdGhpcy5fYiwgdGhpcy5fYSk7XG4gICAgfSxcbiAgICB0b0hleDhTdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJyMnICsgdGhpcy50b0hleDgoKTtcbiAgICB9LFxuICAgIHRvUmdiOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHsgcjogbWF0aFJvdW5kKHRoaXMuX3IpLCBnOiBtYXRoUm91bmQodGhpcy5fZyksIGI6IG1hdGhSb3VuZCh0aGlzLl9iKSwgYTogdGhpcy5fYSB9O1xuICAgIH0sXG4gICAgdG9SZ2JTdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2EgPT0gMSkgP1xuICAgICAgICAgIFwicmdiKFwiICArIG1hdGhSb3VuZCh0aGlzLl9yKSArIFwiLCBcIiArIG1hdGhSb3VuZCh0aGlzLl9nKSArIFwiLCBcIiArIG1hdGhSb3VuZCh0aGlzLl9iKSArIFwiKVwiIDpcbiAgICAgICAgICBcInJnYmEoXCIgKyBtYXRoUm91bmQodGhpcy5fcikgKyBcIiwgXCIgKyBtYXRoUm91bmQodGhpcy5fZykgKyBcIiwgXCIgKyBtYXRoUm91bmQodGhpcy5fYikgKyBcIiwgXCIgKyB0aGlzLl9yb3VuZEEgKyBcIilcIjtcbiAgICB9LFxuICAgIHRvUGVyY2VudGFnZVJnYjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7IHI6IG1hdGhSb3VuZChib3VuZDAxKHRoaXMuX3IsIDI1NSkgKiAxMDApICsgXCIlXCIsIGc6IG1hdGhSb3VuZChib3VuZDAxKHRoaXMuX2csIDI1NSkgKiAxMDApICsgXCIlXCIsIGI6IG1hdGhSb3VuZChib3VuZDAxKHRoaXMuX2IsIDI1NSkgKiAxMDApICsgXCIlXCIsIGE6IHRoaXMuX2EgfTtcbiAgICB9LFxuICAgIHRvUGVyY2VudGFnZVJnYlN0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5fYSA9PSAxKSA/XG4gICAgICAgICAgXCJyZ2IoXCIgICsgbWF0aFJvdW5kKGJvdW5kMDEodGhpcy5fciwgMjU1KSAqIDEwMCkgKyBcIiUsIFwiICsgbWF0aFJvdW5kKGJvdW5kMDEodGhpcy5fZywgMjU1KSAqIDEwMCkgKyBcIiUsIFwiICsgbWF0aFJvdW5kKGJvdW5kMDEodGhpcy5fYiwgMjU1KSAqIDEwMCkgKyBcIiUpXCIgOlxuICAgICAgICAgIFwicmdiYShcIiArIG1hdGhSb3VuZChib3VuZDAxKHRoaXMuX3IsIDI1NSkgKiAxMDApICsgXCIlLCBcIiArIG1hdGhSb3VuZChib3VuZDAxKHRoaXMuX2csIDI1NSkgKiAxMDApICsgXCIlLCBcIiArIG1hdGhSb3VuZChib3VuZDAxKHRoaXMuX2IsIDI1NSkgKiAxMDApICsgXCIlLCBcIiArIHRoaXMuX3JvdW5kQSArIFwiKVwiO1xuICAgIH0sXG4gICAgdG9OYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2EgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBcInRyYW5zcGFyZW50XCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYSA8IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBoZXhOYW1lc1tyZ2JUb0hleCh0aGlzLl9yLCB0aGlzLl9nLCB0aGlzLl9iLCB0cnVlKV0gfHwgZmFsc2U7XG4gICAgfSxcbiAgICB0b0ZpbHRlcjogZnVuY3Rpb24oc2Vjb25kQ29sb3IpIHtcbiAgICAgICAgdmFyIGhleDhTdHJpbmcgPSAnIycgKyByZ2JhVG9IZXgodGhpcy5fciwgdGhpcy5fZywgdGhpcy5fYiwgdGhpcy5fYSk7XG4gICAgICAgIHZhciBzZWNvbmRIZXg4U3RyaW5nID0gaGV4OFN0cmluZztcbiAgICAgICAgdmFyIGdyYWRpZW50VHlwZSA9IHRoaXMuX2dyYWRpZW50VHlwZSA/IFwiR3JhZGllbnRUeXBlID0gMSwgXCIgOiBcIlwiO1xuXG4gICAgICAgIGlmIChzZWNvbmRDb2xvcikge1xuICAgICAgICAgICAgdmFyIHMgPSB0aW55Y29sb3Ioc2Vjb25kQ29sb3IpO1xuICAgICAgICAgICAgc2Vjb25kSGV4OFN0cmluZyA9IHMudG9IZXg4U3RyaW5nKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gXCJwcm9naWQ6RFhJbWFnZVRyYW5zZm9ybS5NaWNyb3NvZnQuZ3JhZGllbnQoXCIrZ3JhZGllbnRUeXBlK1wic3RhcnRDb2xvcnN0cj1cIitoZXg4U3RyaW5nK1wiLGVuZENvbG9yc3RyPVwiK3NlY29uZEhleDhTdHJpbmcrXCIpXCI7XG4gICAgfSxcbiAgICB0b1N0cmluZzogZnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHZhciBmb3JtYXRTZXQgPSAhIWZvcm1hdDtcbiAgICAgICAgZm9ybWF0ID0gZm9ybWF0IHx8IHRoaXMuX2Zvcm1hdDtcblxuICAgICAgICB2YXIgZm9ybWF0dGVkU3RyaW5nID0gZmFsc2U7XG4gICAgICAgIHZhciBoYXNBbHBoYSA9IHRoaXMuX2EgPCAxICYmIHRoaXMuX2EgPj0gMDtcbiAgICAgICAgdmFyIG5lZWRzQWxwaGFGb3JtYXQgPSAhZm9ybWF0U2V0ICYmIGhhc0FscGhhICYmIChmb3JtYXQgPT09IFwiaGV4XCIgfHwgZm9ybWF0ID09PSBcImhleDZcIiB8fCBmb3JtYXQgPT09IFwiaGV4M1wiIHx8IGZvcm1hdCA9PT0gXCJuYW1lXCIpO1xuXG4gICAgICAgIGlmIChuZWVkc0FscGhhRm9ybWF0KSB7XG4gICAgICAgICAgICAvLyBTcGVjaWFsIGNhc2UgZm9yIFwidHJhbnNwYXJlbnRcIiwgYWxsIG90aGVyIG5vbi1hbHBoYSBmb3JtYXRzXG4gICAgICAgICAgICAvLyB3aWxsIHJldHVybiByZ2JhIHdoZW4gdGhlcmUgaXMgdHJhbnNwYXJlbmN5LlxuICAgICAgICAgICAgaWYgKGZvcm1hdCA9PT0gXCJuYW1lXCIgJiYgdGhpcy5fYSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRvTmFtZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9SZ2JTdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZm9ybWF0ID09PSBcInJnYlwiKSB7XG4gICAgICAgICAgICBmb3JtYXR0ZWRTdHJpbmcgPSB0aGlzLnRvUmdiU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZvcm1hdCA9PT0gXCJwcmdiXCIpIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZFN0cmluZyA9IHRoaXMudG9QZXJjZW50YWdlUmdiU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZvcm1hdCA9PT0gXCJoZXhcIiB8fCBmb3JtYXQgPT09IFwiaGV4NlwiKSB7XG4gICAgICAgICAgICBmb3JtYXR0ZWRTdHJpbmcgPSB0aGlzLnRvSGV4U3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZvcm1hdCA9PT0gXCJoZXgzXCIpIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZFN0cmluZyA9IHRoaXMudG9IZXhTdHJpbmcodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZvcm1hdCA9PT0gXCJoZXg4XCIpIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZFN0cmluZyA9IHRoaXMudG9IZXg4U3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZvcm1hdCA9PT0gXCJuYW1lXCIpIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZFN0cmluZyA9IHRoaXMudG9OYW1lKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZvcm1hdCA9PT0gXCJoc2xcIikge1xuICAgICAgICAgICAgZm9ybWF0dGVkU3RyaW5nID0gdGhpcy50b0hzbFN0cmluZygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmb3JtYXQgPT09IFwiaHN2XCIpIHtcbiAgICAgICAgICAgIGZvcm1hdHRlZFN0cmluZyA9IHRoaXMudG9Ic3ZTdHJpbmcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb3JtYXR0ZWRTdHJpbmcgfHwgdGhpcy50b0hleFN0cmluZygpO1xuICAgIH0sXG5cbiAgICBfYXBwbHlNb2RpZmljYXRpb246IGZ1bmN0aW9uKGZuLCBhcmdzKSB7XG4gICAgICAgIHZhciBjb2xvciA9IGZuLmFwcGx5KG51bGwsIFt0aGlzXS5jb25jYXQoW10uc2xpY2UuY2FsbChhcmdzKSkpO1xuICAgICAgICB0aGlzLl9yID0gY29sb3IuX3I7XG4gICAgICAgIHRoaXMuX2cgPSBjb2xvci5fZztcbiAgICAgICAgdGhpcy5fYiA9IGNvbG9yLl9iO1xuICAgICAgICB0aGlzLnNldEFscGhhKGNvbG9yLl9hKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBsaWdodGVuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FwcGx5TW9kaWZpY2F0aW9uKGxpZ2h0ZW4sIGFyZ3VtZW50cyk7XG4gICAgfSxcbiAgICBicmlnaHRlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hcHBseU1vZGlmaWNhdGlvbihicmlnaHRlbiwgYXJndW1lbnRzKTtcbiAgICB9LFxuICAgIGRhcmtlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hcHBseU1vZGlmaWNhdGlvbihkYXJrZW4sIGFyZ3VtZW50cyk7XG4gICAgfSxcbiAgICBkZXNhdHVyYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FwcGx5TW9kaWZpY2F0aW9uKGRlc2F0dXJhdGUsIGFyZ3VtZW50cyk7XG4gICAgfSxcbiAgICBzYXR1cmF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hcHBseU1vZGlmaWNhdGlvbihzYXR1cmF0ZSwgYXJndW1lbnRzKTtcbiAgICB9LFxuICAgIGdyZXlzY2FsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hcHBseU1vZGlmaWNhdGlvbihncmV5c2NhbGUsIGFyZ3VtZW50cyk7XG4gICAgfSxcbiAgICBzcGluOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FwcGx5TW9kaWZpY2F0aW9uKHNwaW4sIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIF9hcHBseUNvbWJpbmF0aW9uOiBmdW5jdGlvbihmbiwgYXJncykge1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkobnVsbCwgW3RoaXNdLmNvbmNhdChbXS5zbGljZS5jYWxsKGFyZ3MpKSk7XG4gICAgfSxcbiAgICBhbmFsb2dvdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYXBwbHlDb21iaW5hdGlvbihhbmFsb2dvdXMsIGFyZ3VtZW50cyk7XG4gICAgfSxcbiAgICBjb21wbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FwcGx5Q29tYmluYXRpb24oY29tcGxlbWVudCwgYXJndW1lbnRzKTtcbiAgICB9LFxuICAgIG1vbm9jaHJvbWF0aWM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYXBwbHlDb21iaW5hdGlvbihtb25vY2hyb21hdGljLCBhcmd1bWVudHMpO1xuICAgIH0sXG4gICAgc3BsaXRjb21wbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FwcGx5Q29tYmluYXRpb24oc3BsaXRjb21wbGVtZW50LCBhcmd1bWVudHMpO1xuICAgIH0sXG4gICAgdHJpYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYXBwbHlDb21iaW5hdGlvbih0cmlhZCwgYXJndW1lbnRzKTtcbiAgICB9LFxuICAgIHRldHJhZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hcHBseUNvbWJpbmF0aW9uKHRldHJhZCwgYXJndW1lbnRzKTtcbiAgICB9XG59O1xuXG4vLyBJZiBpbnB1dCBpcyBhbiBvYmplY3QsIGZvcmNlIDEgaW50byBcIjEuMFwiIHRvIGhhbmRsZSByYXRpb3MgcHJvcGVybHlcbi8vIFN0cmluZyBpbnB1dCByZXF1aXJlcyBcIjEuMFwiIGFzIGlucHV0LCBzbyAxIHdpbGwgYmUgdHJlYXRlZCBhcyAxXG50aW55Y29sb3IuZnJvbVJhdGlvID0gZnVuY3Rpb24oY29sb3IsIG9wdHMpIHtcbiAgICBpZiAodHlwZW9mIGNvbG9yID09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgdmFyIG5ld0NvbG9yID0ge307XG4gICAgICAgIGZvciAodmFyIGkgaW4gY29sb3IpIHtcbiAgICAgICAgICAgIGlmIChjb2xvci5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICAgICAgICAgIGlmIChpID09PSBcImFcIikge1xuICAgICAgICAgICAgICAgICAgICBuZXdDb2xvcltpXSA9IGNvbG9yW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3Q29sb3JbaV0gPSBjb252ZXJ0VG9QZXJjZW50YWdlKGNvbG9yW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29sb3IgPSBuZXdDb2xvcjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGlueWNvbG9yKGNvbG9yLCBvcHRzKTtcbn07XG5cbi8vIEdpdmVuIGEgc3RyaW5nIG9yIG9iamVjdCwgY29udmVydCB0aGF0IGlucHV0IHRvIFJHQlxuLy8gUG9zc2libGUgc3RyaW5nIGlucHV0czpcbi8vXG4vLyAgICAgXCJyZWRcIlxuLy8gICAgIFwiI2YwMFwiIG9yIFwiZjAwXCJcbi8vICAgICBcIiNmZjAwMDBcIiBvciBcImZmMDAwMFwiXG4vLyAgICAgXCIjZmYwMDAwMDBcIiBvciBcImZmMDAwMDAwXCJcbi8vICAgICBcInJnYiAyNTUgMCAwXCIgb3IgXCJyZ2IgKDI1NSwgMCwgMClcIlxuLy8gICAgIFwicmdiIDEuMCAwIDBcIiBvciBcInJnYiAoMSwgMCwgMClcIlxuLy8gICAgIFwicmdiYSAoMjU1LCAwLCAwLCAxKVwiIG9yIFwicmdiYSAyNTUsIDAsIDAsIDFcIlxuLy8gICAgIFwicmdiYSAoMS4wLCAwLCAwLCAxKVwiIG9yIFwicmdiYSAxLjAsIDAsIDAsIDFcIlxuLy8gICAgIFwiaHNsKDAsIDEwMCUsIDUwJSlcIiBvciBcImhzbCAwIDEwMCUgNTAlXCJcbi8vICAgICBcImhzbGEoMCwgMTAwJSwgNTAlLCAxKVwiIG9yIFwiaHNsYSAwIDEwMCUgNTAlLCAxXCJcbi8vICAgICBcImhzdigwLCAxMDAlLCAxMDAlKVwiIG9yIFwiaHN2IDAgMTAwJSAxMDAlXCJcbi8vXG5mdW5jdGlvbiBpbnB1dFRvUkdCKGNvbG9yKSB7XG5cbiAgICB2YXIgcmdiID0geyByOiAwLCBnOiAwLCBiOiAwIH07XG4gICAgdmFyIGEgPSAxO1xuICAgIHZhciBvayA9IGZhbHNlO1xuICAgIHZhciBmb3JtYXQgPSBmYWxzZTtcblxuICAgIGlmICh0eXBlb2YgY29sb3IgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICBjb2xvciA9IHN0cmluZ0lucHV0VG9PYmplY3QoY29sb3IpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgY29sb3IgPT0gXCJvYmplY3RcIikge1xuICAgICAgICBpZiAoY29sb3IuaGFzT3duUHJvcGVydHkoXCJyXCIpICYmIGNvbG9yLmhhc093blByb3BlcnR5KFwiZ1wiKSAmJiBjb2xvci5oYXNPd25Qcm9wZXJ0eShcImJcIikpIHtcbiAgICAgICAgICAgIHJnYiA9IHJnYlRvUmdiKGNvbG9yLnIsIGNvbG9yLmcsIGNvbG9yLmIpO1xuICAgICAgICAgICAgb2sgPSB0cnVlO1xuICAgICAgICAgICAgZm9ybWF0ID0gU3RyaW5nKGNvbG9yLnIpLnN1YnN0cigtMSkgPT09IFwiJVwiID8gXCJwcmdiXCIgOiBcInJnYlwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNvbG9yLmhhc093blByb3BlcnR5KFwiaFwiKSAmJiBjb2xvci5oYXNPd25Qcm9wZXJ0eShcInNcIikgJiYgY29sb3IuaGFzT3duUHJvcGVydHkoXCJ2XCIpKSB7XG4gICAgICAgICAgICBjb2xvci5zID0gY29udmVydFRvUGVyY2VudGFnZShjb2xvci5zKTtcbiAgICAgICAgICAgIGNvbG9yLnYgPSBjb252ZXJ0VG9QZXJjZW50YWdlKGNvbG9yLnYpO1xuICAgICAgICAgICAgcmdiID0gaHN2VG9SZ2IoY29sb3IuaCwgY29sb3IucywgY29sb3Iudik7XG4gICAgICAgICAgICBvayA9IHRydWU7XG4gICAgICAgICAgICBmb3JtYXQgPSBcImhzdlwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNvbG9yLmhhc093blByb3BlcnR5KFwiaFwiKSAmJiBjb2xvci5oYXNPd25Qcm9wZXJ0eShcInNcIikgJiYgY29sb3IuaGFzT3duUHJvcGVydHkoXCJsXCIpKSB7XG4gICAgICAgICAgICBjb2xvci5zID0gY29udmVydFRvUGVyY2VudGFnZShjb2xvci5zKTtcbiAgICAgICAgICAgIGNvbG9yLmwgPSBjb252ZXJ0VG9QZXJjZW50YWdlKGNvbG9yLmwpO1xuICAgICAgICAgICAgcmdiID0gaHNsVG9SZ2IoY29sb3IuaCwgY29sb3IucywgY29sb3IubCk7XG4gICAgICAgICAgICBvayA9IHRydWU7XG4gICAgICAgICAgICBmb3JtYXQgPSBcImhzbFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbG9yLmhhc093blByb3BlcnR5KFwiYVwiKSkge1xuICAgICAgICAgICAgYSA9IGNvbG9yLmE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhID0gYm91bmRBbHBoYShhKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIG9rOiBvayxcbiAgICAgICAgZm9ybWF0OiBjb2xvci5mb3JtYXQgfHwgZm9ybWF0LFxuICAgICAgICByOiBtYXRoTWluKDI1NSwgbWF0aE1heChyZ2IuciwgMCkpLFxuICAgICAgICBnOiBtYXRoTWluKDI1NSwgbWF0aE1heChyZ2IuZywgMCkpLFxuICAgICAgICBiOiBtYXRoTWluKDI1NSwgbWF0aE1heChyZ2IuYiwgMCkpLFxuICAgICAgICBhOiBhXG4gICAgfTtcbn1cblxuXG4vLyBDb252ZXJzaW9uIEZ1bmN0aW9uc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gYHJnYlRvSHNsYCwgYHJnYlRvSHN2YCwgYGhzbFRvUmdiYCwgYGhzdlRvUmdiYCBtb2RpZmllZCBmcm9tOlxuLy8gPGh0dHA6Ly9tamlqYWNrc29uLmNvbS8yMDA4LzAyL3JnYi10by1oc2wtYW5kLXJnYi10by1oc3YtY29sb3ItbW9kZWwtY29udmVyc2lvbi1hbGdvcml0aG1zLWluLWphdmFzY3JpcHQ+XG5cbi8vIGByZ2JUb1JnYmBcbi8vIEhhbmRsZSBib3VuZHMgLyBwZXJjZW50YWdlIGNoZWNraW5nIHRvIGNvbmZvcm0gdG8gQ1NTIGNvbG9yIHNwZWNcbi8vIDxodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLWNvbG9yLz5cbi8vICpBc3N1bWVzOiogciwgZywgYiBpbiBbMCwgMjU1XSBvciBbMCwgMV1cbi8vICpSZXR1cm5zOiogeyByLCBnLCBiIH0gaW4gWzAsIDI1NV1cbmZ1bmN0aW9uIHJnYlRvUmdiKHIsIGcsIGIpe1xuICAgIHJldHVybiB7XG4gICAgICAgIHI6IGJvdW5kMDEociwgMjU1KSAqIDI1NSxcbiAgICAgICAgZzogYm91bmQwMShnLCAyNTUpICogMjU1LFxuICAgICAgICBiOiBib3VuZDAxKGIsIDI1NSkgKiAyNTVcbiAgICB9O1xufVxuXG4vLyBgcmdiVG9Ic2xgXG4vLyBDb252ZXJ0cyBhbiBSR0IgY29sb3IgdmFsdWUgdG8gSFNMLlxuLy8gKkFzc3VtZXM6KiByLCBnLCBhbmQgYiBhcmUgY29udGFpbmVkIGluIFswLCAyNTVdIG9yIFswLCAxXVxuLy8gKlJldHVybnM6KiB7IGgsIHMsIGwgfSBpbiBbMCwxXVxuZnVuY3Rpb24gcmdiVG9Ic2wociwgZywgYikge1xuXG4gICAgciA9IGJvdW5kMDEociwgMjU1KTtcbiAgICBnID0gYm91bmQwMShnLCAyNTUpO1xuICAgIGIgPSBib3VuZDAxKGIsIDI1NSk7XG5cbiAgICB2YXIgbWF4ID0gbWF0aE1heChyLCBnLCBiKSwgbWluID0gbWF0aE1pbihyLCBnLCBiKTtcbiAgICB2YXIgaCwgcywgbCA9IChtYXggKyBtaW4pIC8gMjtcblxuICAgIGlmKG1heCA9PSBtaW4pIHtcbiAgICAgICAgaCA9IHMgPSAwOyAvLyBhY2hyb21hdGljXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgZCA9IG1heCAtIG1pbjtcbiAgICAgICAgcyA9IGwgPiAwLjUgPyBkIC8gKDIgLSBtYXggLSBtaW4pIDogZCAvIChtYXggKyBtaW4pO1xuICAgICAgICBzd2l0Y2gobWF4KSB7XG4gICAgICAgICAgICBjYXNlIHI6IGggPSAoZyAtIGIpIC8gZCArIChnIDwgYiA/IDYgOiAwKTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGc6IGggPSAoYiAtIHIpIC8gZCArIDI7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBiOiBoID0gKHIgLSBnKSAvIGQgKyA0OyBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGggLz0gNjtcbiAgICB9XG5cbiAgICByZXR1cm4geyBoOiBoLCBzOiBzLCBsOiBsIH07XG59XG5cbi8vIGBoc2xUb1JnYmBcbi8vIENvbnZlcnRzIGFuIEhTTCBjb2xvciB2YWx1ZSB0byBSR0IuXG4vLyAqQXNzdW1lczoqIGggaXMgY29udGFpbmVkIGluIFswLCAxXSBvciBbMCwgMzYwXSBhbmQgcyBhbmQgbCBhcmUgY29udGFpbmVkIFswLCAxXSBvciBbMCwgMTAwXVxuLy8gKlJldHVybnM6KiB7IHIsIGcsIGIgfSBpbiB0aGUgc2V0IFswLCAyNTVdXG5mdW5jdGlvbiBoc2xUb1JnYihoLCBzLCBsKSB7XG4gICAgdmFyIHIsIGcsIGI7XG5cbiAgICBoID0gYm91bmQwMShoLCAzNjApO1xuICAgIHMgPSBib3VuZDAxKHMsIDEwMCk7XG4gICAgbCA9IGJvdW5kMDEobCwgMTAwKTtcblxuICAgIGZ1bmN0aW9uIGh1ZTJyZ2IocCwgcSwgdCkge1xuICAgICAgICBpZih0IDwgMCkgdCArPSAxO1xuICAgICAgICBpZih0ID4gMSkgdCAtPSAxO1xuICAgICAgICBpZih0IDwgMS82KSByZXR1cm4gcCArIChxIC0gcCkgKiA2ICogdDtcbiAgICAgICAgaWYodCA8IDEvMikgcmV0dXJuIHE7XG4gICAgICAgIGlmKHQgPCAyLzMpIHJldHVybiBwICsgKHEgLSBwKSAqICgyLzMgLSB0KSAqIDY7XG4gICAgICAgIHJldHVybiBwO1xuICAgIH1cblxuICAgIGlmKHMgPT09IDApIHtcbiAgICAgICAgciA9IGcgPSBiID0gbDsgLy8gYWNocm9tYXRpY1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIHEgPSBsIDwgMC41ID8gbCAqICgxICsgcykgOiBsICsgcyAtIGwgKiBzO1xuICAgICAgICB2YXIgcCA9IDIgKiBsIC0gcTtcbiAgICAgICAgciA9IGh1ZTJyZ2IocCwgcSwgaCArIDEvMyk7XG4gICAgICAgIGcgPSBodWUycmdiKHAsIHEsIGgpO1xuICAgICAgICBiID0gaHVlMnJnYihwLCBxLCBoIC0gMS8zKTtcbiAgICB9XG5cbiAgICByZXR1cm4geyByOiByICogMjU1LCBnOiBnICogMjU1LCBiOiBiICogMjU1IH07XG59XG5cbi8vIGByZ2JUb0hzdmBcbi8vIENvbnZlcnRzIGFuIFJHQiBjb2xvciB2YWx1ZSB0byBIU1Zcbi8vICpBc3N1bWVzOiogciwgZywgYW5kIGIgYXJlIGNvbnRhaW5lZCBpbiB0aGUgc2V0IFswLCAyNTVdIG9yIFswLCAxXVxuLy8gKlJldHVybnM6KiB7IGgsIHMsIHYgfSBpbiBbMCwxXVxuZnVuY3Rpb24gcmdiVG9Ic3YociwgZywgYikge1xuXG4gICAgciA9IGJvdW5kMDEociwgMjU1KTtcbiAgICBnID0gYm91bmQwMShnLCAyNTUpO1xuICAgIGIgPSBib3VuZDAxKGIsIDI1NSk7XG5cbiAgICB2YXIgbWF4ID0gbWF0aE1heChyLCBnLCBiKSwgbWluID0gbWF0aE1pbihyLCBnLCBiKTtcbiAgICB2YXIgaCwgcywgdiA9IG1heDtcblxuICAgIHZhciBkID0gbWF4IC0gbWluO1xuICAgIHMgPSBtYXggPT09IDAgPyAwIDogZCAvIG1heDtcblxuICAgIGlmKG1heCA9PSBtaW4pIHtcbiAgICAgICAgaCA9IDA7IC8vIGFjaHJvbWF0aWNcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHN3aXRjaChtYXgpIHtcbiAgICAgICAgICAgIGNhc2UgcjogaCA9IChnIC0gYikgLyBkICsgKGcgPCBiID8gNiA6IDApOyBicmVhaztcbiAgICAgICAgICAgIGNhc2UgZzogaCA9IChiIC0gcikgLyBkICsgMjsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIGI6IGggPSAociAtIGcpIC8gZCArIDQ7IGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGggLz0gNjtcbiAgICB9XG4gICAgcmV0dXJuIHsgaDogaCwgczogcywgdjogdiB9O1xufVxuXG4vLyBgaHN2VG9SZ2JgXG4vLyBDb252ZXJ0cyBhbiBIU1YgY29sb3IgdmFsdWUgdG8gUkdCLlxuLy8gKkFzc3VtZXM6KiBoIGlzIGNvbnRhaW5lZCBpbiBbMCwgMV0gb3IgWzAsIDM2MF0gYW5kIHMgYW5kIHYgYXJlIGNvbnRhaW5lZCBpbiBbMCwgMV0gb3IgWzAsIDEwMF1cbi8vICpSZXR1cm5zOiogeyByLCBnLCBiIH0gaW4gdGhlIHNldCBbMCwgMjU1XVxuIGZ1bmN0aW9uIGhzdlRvUmdiKGgsIHMsIHYpIHtcblxuICAgIGggPSBib3VuZDAxKGgsIDM2MCkgKiA2O1xuICAgIHMgPSBib3VuZDAxKHMsIDEwMCk7XG4gICAgdiA9IGJvdW5kMDEodiwgMTAwKTtcblxuICAgIHZhciBpID0gbWF0aC5mbG9vcihoKSxcbiAgICAgICAgZiA9IGggLSBpLFxuICAgICAgICBwID0gdiAqICgxIC0gcyksXG4gICAgICAgIHEgPSB2ICogKDEgLSBmICogcyksXG4gICAgICAgIHQgPSB2ICogKDEgLSAoMSAtIGYpICogcyksXG4gICAgICAgIG1vZCA9IGkgJSA2LFxuICAgICAgICByID0gW3YsIHEsIHAsIHAsIHQsIHZdW21vZF0sXG4gICAgICAgIGcgPSBbdCwgdiwgdiwgcSwgcCwgcF1bbW9kXSxcbiAgICAgICAgYiA9IFtwLCBwLCB0LCB2LCB2LCBxXVttb2RdO1xuXG4gICAgcmV0dXJuIHsgcjogciAqIDI1NSwgZzogZyAqIDI1NSwgYjogYiAqIDI1NSB9O1xufVxuXG4vLyBgcmdiVG9IZXhgXG4vLyBDb252ZXJ0cyBhbiBSR0IgY29sb3IgdG8gaGV4XG4vLyBBc3N1bWVzIHIsIGcsIGFuZCBiIGFyZSBjb250YWluZWQgaW4gdGhlIHNldCBbMCwgMjU1XVxuLy8gUmV0dXJucyBhIDMgb3IgNiBjaGFyYWN0ZXIgaGV4XG5mdW5jdGlvbiByZ2JUb0hleChyLCBnLCBiLCBhbGxvdzNDaGFyKSB7XG5cbiAgICB2YXIgaGV4ID0gW1xuICAgICAgICBwYWQyKG1hdGhSb3VuZChyKS50b1N0cmluZygxNikpLFxuICAgICAgICBwYWQyKG1hdGhSb3VuZChnKS50b1N0cmluZygxNikpLFxuICAgICAgICBwYWQyKG1hdGhSb3VuZChiKS50b1N0cmluZygxNikpXG4gICAgXTtcblxuICAgIC8vIFJldHVybiBhIDMgY2hhcmFjdGVyIGhleCBpZiBwb3NzaWJsZVxuICAgIGlmIChhbGxvdzNDaGFyICYmIGhleFswXS5jaGFyQXQoMCkgPT0gaGV4WzBdLmNoYXJBdCgxKSAmJiBoZXhbMV0uY2hhckF0KDApID09IGhleFsxXS5jaGFyQXQoMSkgJiYgaGV4WzJdLmNoYXJBdCgwKSA9PSBoZXhbMl0uY2hhckF0KDEpKSB7XG4gICAgICAgIHJldHVybiBoZXhbMF0uY2hhckF0KDApICsgaGV4WzFdLmNoYXJBdCgwKSArIGhleFsyXS5jaGFyQXQoMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhleC5qb2luKFwiXCIpO1xufVxuICAgIC8vIGByZ2JhVG9IZXhgXG4gICAgLy8gQ29udmVydHMgYW4gUkdCQSBjb2xvciBwbHVzIGFscGhhIHRyYW5zcGFyZW5jeSB0byBoZXhcbiAgICAvLyBBc3N1bWVzIHIsIGcsIGIgYW5kIGEgYXJlIGNvbnRhaW5lZCBpbiB0aGUgc2V0IFswLCAyNTVdXG4gICAgLy8gUmV0dXJucyBhbiA4IGNoYXJhY3RlciBoZXhcbiAgICBmdW5jdGlvbiByZ2JhVG9IZXgociwgZywgYiwgYSkge1xuXG4gICAgICAgIHZhciBoZXggPSBbXG4gICAgICAgICAgICBwYWQyKGNvbnZlcnREZWNpbWFsVG9IZXgoYSkpLFxuICAgICAgICAgICAgcGFkMihtYXRoUm91bmQocikudG9TdHJpbmcoMTYpKSxcbiAgICAgICAgICAgIHBhZDIobWF0aFJvdW5kKGcpLnRvU3RyaW5nKDE2KSksXG4gICAgICAgICAgICBwYWQyKG1hdGhSb3VuZChiKS50b1N0cmluZygxNikpXG4gICAgICAgIF07XG5cbiAgICAgICAgcmV0dXJuIGhleC5qb2luKFwiXCIpO1xuICAgIH1cblxuLy8gYGVxdWFsc2Bcbi8vIENhbiBiZSBjYWxsZWQgd2l0aCBhbnkgdGlueWNvbG9yIGlucHV0XG50aW55Y29sb3IuZXF1YWxzID0gZnVuY3Rpb24gKGNvbG9yMSwgY29sb3IyKSB7XG4gICAgaWYgKCFjb2xvcjEgfHwgIWNvbG9yMikgeyByZXR1cm4gZmFsc2U7IH1cbiAgICByZXR1cm4gdGlueWNvbG9yKGNvbG9yMSkudG9SZ2JTdHJpbmcoKSA9PSB0aW55Y29sb3IoY29sb3IyKS50b1JnYlN0cmluZygpO1xufTtcbnRpbnljb2xvci5yYW5kb20gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGlueWNvbG9yLmZyb21SYXRpbyh7XG4gICAgICAgIHI6IG1hdGhSYW5kb20oKSxcbiAgICAgICAgZzogbWF0aFJhbmRvbSgpLFxuICAgICAgICBiOiBtYXRoUmFuZG9tKClcbiAgICB9KTtcbn07XG5cblxuLy8gTW9kaWZpY2F0aW9uIEZ1bmN0aW9uc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVGhhbmtzIHRvIGxlc3MuanMgZm9yIHNvbWUgb2YgdGhlIGJhc2ljcyBoZXJlXG4vLyA8aHR0cHM6Ly9naXRodWIuY29tL2Nsb3VkaGVhZC9sZXNzLmpzL2Jsb2IvbWFzdGVyL2xpYi9sZXNzL2Z1bmN0aW9ucy5qcz5cblxuZnVuY3Rpb24gZGVzYXR1cmF0ZShjb2xvciwgYW1vdW50KSB7XG4gICAgYW1vdW50ID0gKGFtb3VudCA9PT0gMCkgPyAwIDogKGFtb3VudCB8fCAxMCk7XG4gICAgdmFyIGhzbCA9IHRpbnljb2xvcihjb2xvcikudG9Ic2woKTtcbiAgICBoc2wucyAtPSBhbW91bnQgLyAxMDA7XG4gICAgaHNsLnMgPSBjbGFtcDAxKGhzbC5zKTtcbiAgICByZXR1cm4gdGlueWNvbG9yKGhzbCk7XG59XG5cbmZ1bmN0aW9uIHNhdHVyYXRlKGNvbG9yLCBhbW91bnQpIHtcbiAgICBhbW91bnQgPSAoYW1vdW50ID09PSAwKSA/IDAgOiAoYW1vdW50IHx8IDEwKTtcbiAgICB2YXIgaHNsID0gdGlueWNvbG9yKGNvbG9yKS50b0hzbCgpO1xuICAgIGhzbC5zICs9IGFtb3VudCAvIDEwMDtcbiAgICBoc2wucyA9IGNsYW1wMDEoaHNsLnMpO1xuICAgIHJldHVybiB0aW55Y29sb3IoaHNsKTtcbn1cblxuZnVuY3Rpb24gZ3JleXNjYWxlKGNvbG9yKSB7XG4gICAgcmV0dXJuIHRpbnljb2xvcihjb2xvcikuZGVzYXR1cmF0ZSgxMDApO1xufVxuXG5mdW5jdGlvbiBsaWdodGVuIChjb2xvciwgYW1vdW50KSB7XG4gICAgYW1vdW50ID0gKGFtb3VudCA9PT0gMCkgPyAwIDogKGFtb3VudCB8fCAxMCk7XG4gICAgdmFyIGhzbCA9IHRpbnljb2xvcihjb2xvcikudG9Ic2woKTtcbiAgICBoc2wubCArPSBhbW91bnQgLyAxMDA7XG4gICAgaHNsLmwgPSBjbGFtcDAxKGhzbC5sKTtcbiAgICByZXR1cm4gdGlueWNvbG9yKGhzbCk7XG59XG5cbmZ1bmN0aW9uIGJyaWdodGVuKGNvbG9yLCBhbW91bnQpIHtcbiAgICBhbW91bnQgPSAoYW1vdW50ID09PSAwKSA/IDAgOiAoYW1vdW50IHx8IDEwKTtcbiAgICB2YXIgcmdiID0gdGlueWNvbG9yKGNvbG9yKS50b1JnYigpO1xuICAgIHJnYi5yID0gbWF0aE1heCgwLCBtYXRoTWluKDI1NSwgcmdiLnIgLSBtYXRoUm91bmQoMjU1ICogLSAoYW1vdW50IC8gMTAwKSkpKTtcbiAgICByZ2IuZyA9IG1hdGhNYXgoMCwgbWF0aE1pbigyNTUsIHJnYi5nIC0gbWF0aFJvdW5kKDI1NSAqIC0gKGFtb3VudCAvIDEwMCkpKSk7XG4gICAgcmdiLmIgPSBtYXRoTWF4KDAsIG1hdGhNaW4oMjU1LCByZ2IuYiAtIG1hdGhSb3VuZCgyNTUgKiAtIChhbW91bnQgLyAxMDApKSkpO1xuICAgIHJldHVybiB0aW55Y29sb3IocmdiKTtcbn1cblxuZnVuY3Rpb24gZGFya2VuIChjb2xvciwgYW1vdW50KSB7XG4gICAgYW1vdW50ID0gKGFtb3VudCA9PT0gMCkgPyAwIDogKGFtb3VudCB8fCAxMCk7XG4gICAgdmFyIGhzbCA9IHRpbnljb2xvcihjb2xvcikudG9Ic2woKTtcbiAgICBoc2wubCAtPSBhbW91bnQgLyAxMDA7XG4gICAgaHNsLmwgPSBjbGFtcDAxKGhzbC5sKTtcbiAgICByZXR1cm4gdGlueWNvbG9yKGhzbCk7XG59XG5cbi8vIFNwaW4gdGFrZXMgYSBwb3NpdGl2ZSBvciBuZWdhdGl2ZSBhbW91bnQgd2l0aGluIFstMzYwLCAzNjBdIGluZGljYXRpbmcgdGhlIGNoYW5nZSBvZiBodWUuXG4vLyBWYWx1ZXMgb3V0c2lkZSBvZiB0aGlzIHJhbmdlIHdpbGwgYmUgd3JhcHBlZCBpbnRvIHRoaXMgcmFuZ2UuXG5mdW5jdGlvbiBzcGluKGNvbG9yLCBhbW91bnQpIHtcbiAgICB2YXIgaHNsID0gdGlueWNvbG9yKGNvbG9yKS50b0hzbCgpO1xuICAgIHZhciBodWUgPSAobWF0aFJvdW5kKGhzbC5oKSArIGFtb3VudCkgJSAzNjA7XG4gICAgaHNsLmggPSBodWUgPCAwID8gMzYwICsgaHVlIDogaHVlO1xuICAgIHJldHVybiB0aW55Y29sb3IoaHNsKTtcbn1cblxuLy8gQ29tYmluYXRpb24gRnVuY3Rpb25zXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRoYW5rcyB0byBqUXVlcnkgeENvbG9yIGZvciBzb21lIG9mIHRoZSBpZGVhcyBiZWhpbmQgdGhlc2Vcbi8vIDxodHRwczovL2dpdGh1Yi5jb20vaW5mdXNpb24valF1ZXJ5LXhjb2xvci9ibG9iL21hc3Rlci9qcXVlcnkueGNvbG9yLmpzPlxuXG5mdW5jdGlvbiBjb21wbGVtZW50KGNvbG9yKSB7XG4gICAgdmFyIGhzbCA9IHRpbnljb2xvcihjb2xvcikudG9Ic2woKTtcbiAgICBoc2wuaCA9IChoc2wuaCArIDE4MCkgJSAzNjA7XG4gICAgcmV0dXJuIHRpbnljb2xvcihoc2wpO1xufVxuXG5mdW5jdGlvbiB0cmlhZChjb2xvcikge1xuICAgIHZhciBoc2wgPSB0aW55Y29sb3IoY29sb3IpLnRvSHNsKCk7XG4gICAgdmFyIGggPSBoc2wuaDtcbiAgICByZXR1cm4gW1xuICAgICAgICB0aW55Y29sb3IoY29sb3IpLFxuICAgICAgICB0aW55Y29sb3IoeyBoOiAoaCArIDEyMCkgJSAzNjAsIHM6IGhzbC5zLCBsOiBoc2wubCB9KSxcbiAgICAgICAgdGlueWNvbG9yKHsgaDogKGggKyAyNDApICUgMzYwLCBzOiBoc2wucywgbDogaHNsLmwgfSlcbiAgICBdO1xufVxuXG5mdW5jdGlvbiB0ZXRyYWQoY29sb3IpIHtcbiAgICB2YXIgaHNsID0gdGlueWNvbG9yKGNvbG9yKS50b0hzbCgpO1xuICAgIHZhciBoID0gaHNsLmg7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgdGlueWNvbG9yKGNvbG9yKSxcbiAgICAgICAgdGlueWNvbG9yKHsgaDogKGggKyA5MCkgJSAzNjAsIHM6IGhzbC5zLCBsOiBoc2wubCB9KSxcbiAgICAgICAgdGlueWNvbG9yKHsgaDogKGggKyAxODApICUgMzYwLCBzOiBoc2wucywgbDogaHNsLmwgfSksXG4gICAgICAgIHRpbnljb2xvcih7IGg6IChoICsgMjcwKSAlIDM2MCwgczogaHNsLnMsIGw6IGhzbC5sIH0pXG4gICAgXTtcbn1cblxuZnVuY3Rpb24gc3BsaXRjb21wbGVtZW50KGNvbG9yKSB7XG4gICAgdmFyIGhzbCA9IHRpbnljb2xvcihjb2xvcikudG9Ic2woKTtcbiAgICB2YXIgaCA9IGhzbC5oO1xuICAgIHJldHVybiBbXG4gICAgICAgIHRpbnljb2xvcihjb2xvciksXG4gICAgICAgIHRpbnljb2xvcih7IGg6IChoICsgNzIpICUgMzYwLCBzOiBoc2wucywgbDogaHNsLmx9KSxcbiAgICAgICAgdGlueWNvbG9yKHsgaDogKGggKyAyMTYpICUgMzYwLCBzOiBoc2wucywgbDogaHNsLmx9KVxuICAgIF07XG59XG5cbmZ1bmN0aW9uIGFuYWxvZ291cyhjb2xvciwgcmVzdWx0cywgc2xpY2VzKSB7XG4gICAgcmVzdWx0cyA9IHJlc3VsdHMgfHwgNjtcbiAgICBzbGljZXMgPSBzbGljZXMgfHwgMzA7XG5cbiAgICB2YXIgaHNsID0gdGlueWNvbG9yKGNvbG9yKS50b0hzbCgpO1xuICAgIHZhciBwYXJ0ID0gMzYwIC8gc2xpY2VzO1xuICAgIHZhciByZXQgPSBbdGlueWNvbG9yKGNvbG9yKV07XG5cbiAgICBmb3IgKGhzbC5oID0gKChoc2wuaCAtIChwYXJ0ICogcmVzdWx0cyA+PiAxKSkgKyA3MjApICUgMzYwOyAtLXJlc3VsdHM7ICkge1xuICAgICAgICBoc2wuaCA9IChoc2wuaCArIHBhcnQpICUgMzYwO1xuICAgICAgICByZXQucHVzaCh0aW55Y29sb3IoaHNsKSk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIG1vbm9jaHJvbWF0aWMoY29sb3IsIHJlc3VsdHMpIHtcbiAgICByZXN1bHRzID0gcmVzdWx0cyB8fCA2O1xuICAgIHZhciBoc3YgPSB0aW55Y29sb3IoY29sb3IpLnRvSHN2KCk7XG4gICAgdmFyIGggPSBoc3YuaCwgcyA9IGhzdi5zLCB2ID0gaHN2LnY7XG4gICAgdmFyIHJldCA9IFtdO1xuICAgIHZhciBtb2RpZmljYXRpb24gPSAxIC8gcmVzdWx0cztcblxuICAgIHdoaWxlIChyZXN1bHRzLS0pIHtcbiAgICAgICAgcmV0LnB1c2godGlueWNvbG9yKHsgaDogaCwgczogcywgdjogdn0pKTtcbiAgICAgICAgdiA9ICh2ICsgbW9kaWZpY2F0aW9uKSAlIDE7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbn1cblxuLy8gVXRpbGl0eSBGdW5jdGlvbnNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG50aW55Y29sb3IubWl4ID0gZnVuY3Rpb24oY29sb3IxLCBjb2xvcjIsIGFtb3VudCkge1xuICAgIGFtb3VudCA9IChhbW91bnQgPT09IDApID8gMCA6IChhbW91bnQgfHwgNTApO1xuXG4gICAgdmFyIHJnYjEgPSB0aW55Y29sb3IoY29sb3IxKS50b1JnYigpO1xuICAgIHZhciByZ2IyID0gdGlueWNvbG9yKGNvbG9yMikudG9SZ2IoKTtcblxuICAgIHZhciBwID0gYW1vdW50IC8gMTAwO1xuICAgIHZhciB3ID0gcCAqIDIgLSAxO1xuICAgIHZhciBhID0gcmdiMi5hIC0gcmdiMS5hO1xuXG4gICAgdmFyIHcxO1xuXG4gICAgaWYgKHcgKiBhID09IC0xKSB7XG4gICAgICAgIHcxID0gdztcbiAgICB9IGVsc2Uge1xuICAgICAgICB3MSA9ICh3ICsgYSkgLyAoMSArIHcgKiBhKTtcbiAgICB9XG5cbiAgICB3MSA9ICh3MSArIDEpIC8gMjtcblxuICAgIHZhciB3MiA9IDEgLSB3MTtcblxuICAgIHZhciByZ2JhID0ge1xuICAgICAgICByOiByZ2IyLnIgKiB3MSArIHJnYjEuciAqIHcyLFxuICAgICAgICBnOiByZ2IyLmcgKiB3MSArIHJnYjEuZyAqIHcyLFxuICAgICAgICBiOiByZ2IyLmIgKiB3MSArIHJnYjEuYiAqIHcyLFxuICAgICAgICBhOiByZ2IyLmEgKiBwICArIHJnYjEuYSAqICgxIC0gcClcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRpbnljb2xvcihyZ2JhKTtcbn07XG5cblxuLy8gUmVhZGFiaWxpdHkgRnVuY3Rpb25zXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIDxodHRwOi8vd3d3LnczLm9yZy9UUi9BRVJUI2NvbG9yLWNvbnRyYXN0PlxuXG4vLyBgcmVhZGFiaWxpdHlgXG4vLyBBbmFseXplIHRoZSAyIGNvbG9ycyBhbmQgcmV0dXJucyBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4vLyAgICBgYnJpZ2h0bmVzc2A6IGRpZmZlcmVuY2UgaW4gYnJpZ2h0bmVzcyBiZXR3ZWVuIHRoZSB0d28gY29sb3JzXG4vLyAgICBgY29sb3JgOiBkaWZmZXJlbmNlIGluIGNvbG9yL2h1ZSBiZXR3ZWVuIHRoZSB0d28gY29sb3JzXG50aW55Y29sb3IucmVhZGFiaWxpdHkgPSBmdW5jdGlvbihjb2xvcjEsIGNvbG9yMikge1xuICAgIHZhciBjMSA9IHRpbnljb2xvcihjb2xvcjEpO1xuICAgIHZhciBjMiA9IHRpbnljb2xvcihjb2xvcjIpO1xuICAgIHZhciByZ2IxID0gYzEudG9SZ2IoKTtcbiAgICB2YXIgcmdiMiA9IGMyLnRvUmdiKCk7XG4gICAgdmFyIGJyaWdodG5lc3NBID0gYzEuZ2V0QnJpZ2h0bmVzcygpO1xuICAgIHZhciBicmlnaHRuZXNzQiA9IGMyLmdldEJyaWdodG5lc3MoKTtcbiAgICB2YXIgY29sb3JEaWZmID0gKFxuICAgICAgICBNYXRoLm1heChyZ2IxLnIsIHJnYjIucikgLSBNYXRoLm1pbihyZ2IxLnIsIHJnYjIucikgK1xuICAgICAgICBNYXRoLm1heChyZ2IxLmcsIHJnYjIuZykgLSBNYXRoLm1pbihyZ2IxLmcsIHJnYjIuZykgK1xuICAgICAgICBNYXRoLm1heChyZ2IxLmIsIHJnYjIuYikgLSBNYXRoLm1pbihyZ2IxLmIsIHJnYjIuYilcbiAgICApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYnJpZ2h0bmVzczogTWF0aC5hYnMoYnJpZ2h0bmVzc0EgLSBicmlnaHRuZXNzQiksXG4gICAgICAgIGNvbG9yOiBjb2xvckRpZmZcbiAgICB9O1xufTtcblxuLy8gYHJlYWRhYmxlYFxuLy8gaHR0cDovL3d3dy53My5vcmcvVFIvQUVSVCNjb2xvci1jb250cmFzdFxuLy8gRW5zdXJlIHRoYXQgZm9yZWdyb3VuZCBhbmQgYmFja2dyb3VuZCBjb2xvciBjb21iaW5hdGlvbnMgcHJvdmlkZSBzdWZmaWNpZW50IGNvbnRyYXN0LlxuLy8gKkV4YW1wbGUqXG4vLyAgICB0aW55Y29sb3IuaXNSZWFkYWJsZShcIiMwMDBcIiwgXCIjMTExXCIpID0+IGZhbHNlXG50aW55Y29sb3IuaXNSZWFkYWJsZSA9IGZ1bmN0aW9uKGNvbG9yMSwgY29sb3IyKSB7XG4gICAgdmFyIHJlYWRhYmlsaXR5ID0gdGlueWNvbG9yLnJlYWRhYmlsaXR5KGNvbG9yMSwgY29sb3IyKTtcbiAgICByZXR1cm4gcmVhZGFiaWxpdHkuYnJpZ2h0bmVzcyA+IDEyNSAmJiByZWFkYWJpbGl0eS5jb2xvciA+IDUwMDtcbn07XG5cbi8vIGBtb3N0UmVhZGFibGVgXG4vLyBHaXZlbiBhIGJhc2UgY29sb3IgYW5kIGEgbGlzdCBvZiBwb3NzaWJsZSBmb3JlZ3JvdW5kIG9yIGJhY2tncm91bmRcbi8vIGNvbG9ycyBmb3IgdGhhdCBiYXNlLCByZXR1cm5zIHRoZSBtb3N0IHJlYWRhYmxlIGNvbG9yLlxuLy8gKkV4YW1wbGUqXG4vLyAgICB0aW55Y29sb3IubW9zdFJlYWRhYmxlKFwiIzEyM1wiLCBbXCIjZmZmXCIsIFwiIzAwMFwiXSkgPT4gXCIjMDAwXCJcbnRpbnljb2xvci5tb3N0UmVhZGFibGUgPSBmdW5jdGlvbihiYXNlQ29sb3IsIGNvbG9yTGlzdCkge1xuICAgIHZhciBiZXN0Q29sb3IgPSBudWxsO1xuICAgIHZhciBiZXN0U2NvcmUgPSAwO1xuICAgIHZhciBiZXN0SXNSZWFkYWJsZSA9IGZhbHNlO1xuICAgIGZvciAodmFyIGk9MDsgaSA8IGNvbG9yTGlzdC5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgIC8vIFdlIG5vcm1hbGl6ZSBib3RoIGFyb3VuZCB0aGUgXCJhY2NlcHRhYmxlXCIgYnJlYWtpbmcgcG9pbnQsXG4gICAgICAgIC8vIGJ1dCByYW5rIGJyaWdodG5lc3MgY29uc3RyYXN0IGhpZ2hlciB0aGFuIGh1ZS5cblxuICAgICAgICB2YXIgcmVhZGFiaWxpdHkgPSB0aW55Y29sb3IucmVhZGFiaWxpdHkoYmFzZUNvbG9yLCBjb2xvckxpc3RbaV0pO1xuICAgICAgICB2YXIgcmVhZGFibGUgPSByZWFkYWJpbGl0eS5icmlnaHRuZXNzID4gMTI1ICYmIHJlYWRhYmlsaXR5LmNvbG9yID4gNTAwO1xuICAgICAgICB2YXIgc2NvcmUgPSAzICogKHJlYWRhYmlsaXR5LmJyaWdodG5lc3MgLyAxMjUpICsgKHJlYWRhYmlsaXR5LmNvbG9yIC8gNTAwKTtcblxuICAgICAgICBpZiAoKHJlYWRhYmxlICYmICEgYmVzdElzUmVhZGFibGUpIHx8XG4gICAgICAgICAgICAocmVhZGFibGUgJiYgYmVzdElzUmVhZGFibGUgJiYgc2NvcmUgPiBiZXN0U2NvcmUpIHx8XG4gICAgICAgICAgICAoKCEgcmVhZGFibGUpICYmICghIGJlc3RJc1JlYWRhYmxlKSAmJiBzY29yZSA+IGJlc3RTY29yZSkpIHtcbiAgICAgICAgICAgIGJlc3RJc1JlYWRhYmxlID0gcmVhZGFibGU7XG4gICAgICAgICAgICBiZXN0U2NvcmUgPSBzY29yZTtcbiAgICAgICAgICAgIGJlc3RDb2xvciA9IHRpbnljb2xvcihjb2xvckxpc3RbaV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBiZXN0Q29sb3I7XG59O1xuXG5cbi8vIEJpZyBMaXN0IG9mIENvbG9yc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyA8aHR0cDovL3d3dy53My5vcmcvVFIvY3NzMy1jb2xvci8jc3ZnLWNvbG9yPlxudmFyIG5hbWVzID0gdGlueWNvbG9yLm5hbWVzID0ge1xuICAgIGFsaWNlYmx1ZTogXCJmMGY4ZmZcIixcbiAgICBhbnRpcXVld2hpdGU6IFwiZmFlYmQ3XCIsXG4gICAgYXF1YTogXCIwZmZcIixcbiAgICBhcXVhbWFyaW5lOiBcIjdmZmZkNFwiLFxuICAgIGF6dXJlOiBcImYwZmZmZlwiLFxuICAgIGJlaWdlOiBcImY1ZjVkY1wiLFxuICAgIGJpc3F1ZTogXCJmZmU0YzRcIixcbiAgICBibGFjazogXCIwMDBcIixcbiAgICBibGFuY2hlZGFsbW9uZDogXCJmZmViY2RcIixcbiAgICBibHVlOiBcIjAwZlwiLFxuICAgIGJsdWV2aW9sZXQ6IFwiOGEyYmUyXCIsXG4gICAgYnJvd246IFwiYTUyYTJhXCIsXG4gICAgYnVybHl3b29kOiBcImRlYjg4N1wiLFxuICAgIGJ1cm50c2llbm5hOiBcImVhN2U1ZFwiLFxuICAgIGNhZGV0Ymx1ZTogXCI1ZjllYTBcIixcbiAgICBjaGFydHJldXNlOiBcIjdmZmYwMFwiLFxuICAgIGNob2NvbGF0ZTogXCJkMjY5MWVcIixcbiAgICBjb3JhbDogXCJmZjdmNTBcIixcbiAgICBjb3JuZmxvd2VyYmx1ZTogXCI2NDk1ZWRcIixcbiAgICBjb3Juc2lsazogXCJmZmY4ZGNcIixcbiAgICBjcmltc29uOiBcImRjMTQzY1wiLFxuICAgIGN5YW46IFwiMGZmXCIsXG4gICAgZGFya2JsdWU6IFwiMDAwMDhiXCIsXG4gICAgZGFya2N5YW46IFwiMDA4YjhiXCIsXG4gICAgZGFya2dvbGRlbnJvZDogXCJiODg2MGJcIixcbiAgICBkYXJrZ3JheTogXCJhOWE5YTlcIixcbiAgICBkYXJrZ3JlZW46IFwiMDA2NDAwXCIsXG4gICAgZGFya2dyZXk6IFwiYTlhOWE5XCIsXG4gICAgZGFya2toYWtpOiBcImJkYjc2YlwiLFxuICAgIGRhcmttYWdlbnRhOiBcIjhiMDA4YlwiLFxuICAgIGRhcmtvbGl2ZWdyZWVuOiBcIjU1NmIyZlwiLFxuICAgIGRhcmtvcmFuZ2U6IFwiZmY4YzAwXCIsXG4gICAgZGFya29yY2hpZDogXCI5OTMyY2NcIixcbiAgICBkYXJrcmVkOiBcIjhiMDAwMFwiLFxuICAgIGRhcmtzYWxtb246IFwiZTk5NjdhXCIsXG4gICAgZGFya3NlYWdyZWVuOiBcIjhmYmM4ZlwiLFxuICAgIGRhcmtzbGF0ZWJsdWU6IFwiNDgzZDhiXCIsXG4gICAgZGFya3NsYXRlZ3JheTogXCIyZjRmNGZcIixcbiAgICBkYXJrc2xhdGVncmV5OiBcIjJmNGY0ZlwiLFxuICAgIGRhcmt0dXJxdW9pc2U6IFwiMDBjZWQxXCIsXG4gICAgZGFya3Zpb2xldDogXCI5NDAwZDNcIixcbiAgICBkZWVwcGluazogXCJmZjE0OTNcIixcbiAgICBkZWVwc2t5Ymx1ZTogXCIwMGJmZmZcIixcbiAgICBkaW1ncmF5OiBcIjY5Njk2OVwiLFxuICAgIGRpbWdyZXk6IFwiNjk2OTY5XCIsXG4gICAgZG9kZ2VyYmx1ZTogXCIxZTkwZmZcIixcbiAgICBmaXJlYnJpY2s6IFwiYjIyMjIyXCIsXG4gICAgZmxvcmFsd2hpdGU6IFwiZmZmYWYwXCIsXG4gICAgZm9yZXN0Z3JlZW46IFwiMjI4YjIyXCIsXG4gICAgZnVjaHNpYTogXCJmMGZcIixcbiAgICBnYWluc2Jvcm86IFwiZGNkY2RjXCIsXG4gICAgZ2hvc3R3aGl0ZTogXCJmOGY4ZmZcIixcbiAgICBnb2xkOiBcImZmZDcwMFwiLFxuICAgIGdvbGRlbnJvZDogXCJkYWE1MjBcIixcbiAgICBncmF5OiBcIjgwODA4MFwiLFxuICAgIGdyZWVuOiBcIjAwODAwMFwiLFxuICAgIGdyZWVueWVsbG93OiBcImFkZmYyZlwiLFxuICAgIGdyZXk6IFwiODA4MDgwXCIsXG4gICAgaG9uZXlkZXc6IFwiZjBmZmYwXCIsXG4gICAgaG90cGluazogXCJmZjY5YjRcIixcbiAgICBpbmRpYW5yZWQ6IFwiY2Q1YzVjXCIsXG4gICAgaW5kaWdvOiBcIjRiMDA4MlwiLFxuICAgIGl2b3J5OiBcImZmZmZmMFwiLFxuICAgIGtoYWtpOiBcImYwZTY4Y1wiLFxuICAgIGxhdmVuZGVyOiBcImU2ZTZmYVwiLFxuICAgIGxhdmVuZGVyYmx1c2g6IFwiZmZmMGY1XCIsXG4gICAgbGF3bmdyZWVuOiBcIjdjZmMwMFwiLFxuICAgIGxlbW9uY2hpZmZvbjogXCJmZmZhY2RcIixcbiAgICBsaWdodGJsdWU6IFwiYWRkOGU2XCIsXG4gICAgbGlnaHRjb3JhbDogXCJmMDgwODBcIixcbiAgICBsaWdodGN5YW46IFwiZTBmZmZmXCIsXG4gICAgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6IFwiZmFmYWQyXCIsXG4gICAgbGlnaHRncmF5OiBcImQzZDNkM1wiLFxuICAgIGxpZ2h0Z3JlZW46IFwiOTBlZTkwXCIsXG4gICAgbGlnaHRncmV5OiBcImQzZDNkM1wiLFxuICAgIGxpZ2h0cGluazogXCJmZmI2YzFcIixcbiAgICBsaWdodHNhbG1vbjogXCJmZmEwN2FcIixcbiAgICBsaWdodHNlYWdyZWVuOiBcIjIwYjJhYVwiLFxuICAgIGxpZ2h0c2t5Ymx1ZTogXCI4N2NlZmFcIixcbiAgICBsaWdodHNsYXRlZ3JheTogXCI3ODlcIixcbiAgICBsaWdodHNsYXRlZ3JleTogXCI3ODlcIixcbiAgICBsaWdodHN0ZWVsYmx1ZTogXCJiMGM0ZGVcIixcbiAgICBsaWdodHllbGxvdzogXCJmZmZmZTBcIixcbiAgICBsaW1lOiBcIjBmMFwiLFxuICAgIGxpbWVncmVlbjogXCIzMmNkMzJcIixcbiAgICBsaW5lbjogXCJmYWYwZTZcIixcbiAgICBtYWdlbnRhOiBcImYwZlwiLFxuICAgIG1hcm9vbjogXCI4MDAwMDBcIixcbiAgICBtZWRpdW1hcXVhbWFyaW5lOiBcIjY2Y2RhYVwiLFxuICAgIG1lZGl1bWJsdWU6IFwiMDAwMGNkXCIsXG4gICAgbWVkaXVtb3JjaGlkOiBcImJhNTVkM1wiLFxuICAgIG1lZGl1bXB1cnBsZTogXCI5MzcwZGJcIixcbiAgICBtZWRpdW1zZWFncmVlbjogXCIzY2IzNzFcIixcbiAgICBtZWRpdW1zbGF0ZWJsdWU6IFwiN2I2OGVlXCIsXG4gICAgbWVkaXVtc3ByaW5nZ3JlZW46IFwiMDBmYTlhXCIsXG4gICAgbWVkaXVtdHVycXVvaXNlOiBcIjQ4ZDFjY1wiLFxuICAgIG1lZGl1bXZpb2xldHJlZDogXCJjNzE1ODVcIixcbiAgICBtaWRuaWdodGJsdWU6IFwiMTkxOTcwXCIsXG4gICAgbWludGNyZWFtOiBcImY1ZmZmYVwiLFxuICAgIG1pc3R5cm9zZTogXCJmZmU0ZTFcIixcbiAgICBtb2NjYXNpbjogXCJmZmU0YjVcIixcbiAgICBuYXZham93aGl0ZTogXCJmZmRlYWRcIixcbiAgICBuYXZ5OiBcIjAwMDA4MFwiLFxuICAgIG9sZGxhY2U6IFwiZmRmNWU2XCIsXG4gICAgb2xpdmU6IFwiODA4MDAwXCIsXG4gICAgb2xpdmVkcmFiOiBcIjZiOGUyM1wiLFxuICAgIG9yYW5nZTogXCJmZmE1MDBcIixcbiAgICBvcmFuZ2VyZWQ6IFwiZmY0NTAwXCIsXG4gICAgb3JjaGlkOiBcImRhNzBkNlwiLFxuICAgIHBhbGVnb2xkZW5yb2Q6IFwiZWVlOGFhXCIsXG4gICAgcGFsZWdyZWVuOiBcIjk4ZmI5OFwiLFxuICAgIHBhbGV0dXJxdW9pc2U6IFwiYWZlZWVlXCIsXG4gICAgcGFsZXZpb2xldHJlZDogXCJkYjcwOTNcIixcbiAgICBwYXBheWF3aGlwOiBcImZmZWZkNVwiLFxuICAgIHBlYWNocHVmZjogXCJmZmRhYjlcIixcbiAgICBwZXJ1OiBcImNkODUzZlwiLFxuICAgIHBpbms6IFwiZmZjMGNiXCIsXG4gICAgcGx1bTogXCJkZGEwZGRcIixcbiAgICBwb3dkZXJibHVlOiBcImIwZTBlNlwiLFxuICAgIHB1cnBsZTogXCI4MDAwODBcIixcbiAgICByZWQ6IFwiZjAwXCIsXG4gICAgcm9zeWJyb3duOiBcImJjOGY4ZlwiLFxuICAgIHJveWFsYmx1ZTogXCI0MTY5ZTFcIixcbiAgICBzYWRkbGVicm93bjogXCI4YjQ1MTNcIixcbiAgICBzYWxtb246IFwiZmE4MDcyXCIsXG4gICAgc2FuZHlicm93bjogXCJmNGE0NjBcIixcbiAgICBzZWFncmVlbjogXCIyZThiNTdcIixcbiAgICBzZWFzaGVsbDogXCJmZmY1ZWVcIixcbiAgICBzaWVubmE6IFwiYTA1MjJkXCIsXG4gICAgc2lsdmVyOiBcImMwYzBjMFwiLFxuICAgIHNreWJsdWU6IFwiODdjZWViXCIsXG4gICAgc2xhdGVibHVlOiBcIjZhNWFjZFwiLFxuICAgIHNsYXRlZ3JheTogXCI3MDgwOTBcIixcbiAgICBzbGF0ZWdyZXk6IFwiNzA4MDkwXCIsXG4gICAgc25vdzogXCJmZmZhZmFcIixcbiAgICBzcHJpbmdncmVlbjogXCIwMGZmN2ZcIixcbiAgICBzdGVlbGJsdWU6IFwiNDY4MmI0XCIsXG4gICAgdGFuOiBcImQyYjQ4Y1wiLFxuICAgIHRlYWw6IFwiMDA4MDgwXCIsXG4gICAgdGhpc3RsZTogXCJkOGJmZDhcIixcbiAgICB0b21hdG86IFwiZmY2MzQ3XCIsXG4gICAgdHVycXVvaXNlOiBcIjQwZTBkMFwiLFxuICAgIHZpb2xldDogXCJlZTgyZWVcIixcbiAgICB3aGVhdDogXCJmNWRlYjNcIixcbiAgICB3aGl0ZTogXCJmZmZcIixcbiAgICB3aGl0ZXNtb2tlOiBcImY1ZjVmNVwiLFxuICAgIHllbGxvdzogXCJmZjBcIixcbiAgICB5ZWxsb3dncmVlbjogXCI5YWNkMzJcIlxufTtcblxuLy8gTWFrZSBpdCBlYXN5IHRvIGFjY2VzcyBjb2xvcnMgdmlhIGBoZXhOYW1lc1toZXhdYFxudmFyIGhleE5hbWVzID0gdGlueWNvbG9yLmhleE5hbWVzID0gZmxpcChuYW1lcyk7XG5cblxuLy8gVXRpbGl0aWVzXG4vLyAtLS0tLS0tLS1cblxuLy8gYHsgJ25hbWUxJzogJ3ZhbDEnIH1gIGJlY29tZXMgYHsgJ3ZhbDEnOiAnbmFtZTEnIH1gXG5mdW5jdGlvbiBmbGlwKG8pIHtcbiAgICB2YXIgZmxpcHBlZCA9IHsgfTtcbiAgICBmb3IgKHZhciBpIGluIG8pIHtcbiAgICAgICAgaWYgKG8uaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgIGZsaXBwZWRbb1tpXV0gPSBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmbGlwcGVkO1xufVxuXG4vLyBSZXR1cm4gYSB2YWxpZCBhbHBoYSB2YWx1ZSBbMCwxXSB3aXRoIGFsbCBpbnZhbGlkIHZhbHVlcyBiZWluZyBzZXQgdG8gMVxuZnVuY3Rpb24gYm91bmRBbHBoYShhKSB7XG4gICAgYSA9IHBhcnNlRmxvYXQoYSk7XG5cbiAgICBpZiAoaXNOYU4oYSkgfHwgYSA8IDAgfHwgYSA+IDEpIHtcbiAgICAgICAgYSA9IDE7XG4gICAgfVxuXG4gICAgcmV0dXJuIGE7XG59XG5cbi8vIFRha2UgaW5wdXQgZnJvbSBbMCwgbl0gYW5kIHJldHVybiBpdCBhcyBbMCwgMV1cbmZ1bmN0aW9uIGJvdW5kMDEobiwgbWF4KSB7XG4gICAgaWYgKGlzT25lUG9pbnRaZXJvKG4pKSB7IG4gPSBcIjEwMCVcIjsgfVxuXG4gICAgdmFyIHByb2Nlc3NQZXJjZW50ID0gaXNQZXJjZW50YWdlKG4pO1xuICAgIG4gPSBtYXRoTWluKG1heCwgbWF0aE1heCgwLCBwYXJzZUZsb2F0KG4pKSk7XG5cbiAgICAvLyBBdXRvbWF0aWNhbGx5IGNvbnZlcnQgcGVyY2VudGFnZSBpbnRvIG51bWJlclxuICAgIGlmIChwcm9jZXNzUGVyY2VudCkge1xuICAgICAgICBuID0gcGFyc2VJbnQobiAqIG1heCwgMTApIC8gMTAwO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBmbG9hdGluZyBwb2ludCByb3VuZGluZyBlcnJvcnNcbiAgICBpZiAoKG1hdGguYWJzKG4gLSBtYXgpIDwgMC4wMDAwMDEpKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgIH1cblxuICAgIC8vIENvbnZlcnQgaW50byBbMCwgMV0gcmFuZ2UgaWYgaXQgaXNuJ3QgYWxyZWFkeVxuICAgIHJldHVybiAobiAlIG1heCkgLyBwYXJzZUZsb2F0KG1heCk7XG59XG5cbi8vIEZvcmNlIGEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMVxuZnVuY3Rpb24gY2xhbXAwMSh2YWwpIHtcbiAgICByZXR1cm4gbWF0aE1pbigxLCBtYXRoTWF4KDAsIHZhbCkpO1xufVxuXG4vLyBQYXJzZSBhIGJhc2UtMTYgaGV4IHZhbHVlIGludG8gYSBiYXNlLTEwIGludGVnZXJcbmZ1bmN0aW9uIHBhcnNlSW50RnJvbUhleCh2YWwpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQodmFsLCAxNik7XG59XG5cbi8vIE5lZWQgdG8gaGFuZGxlIDEuMCBhcyAxMDAlLCBzaW5jZSBvbmNlIGl0IGlzIGEgbnVtYmVyLCB0aGVyZSBpcyBubyBkaWZmZXJlbmNlIGJldHdlZW4gaXQgYW5kIDFcbi8vIDxodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzc0MjIwNzIvamF2YXNjcmlwdC1ob3ctdG8tZGV0ZWN0LW51bWJlci1hcy1hLWRlY2ltYWwtaW5jbHVkaW5nLTEtMD5cbmZ1bmN0aW9uIGlzT25lUG9pbnRaZXJvKG4pIHtcbiAgICByZXR1cm4gdHlwZW9mIG4gPT0gXCJzdHJpbmdcIiAmJiBuLmluZGV4T2YoJy4nKSAhPSAtMSAmJiBwYXJzZUZsb2F0KG4pID09PSAxO1xufVxuXG4vLyBDaGVjayB0byBzZWUgaWYgc3RyaW5nIHBhc3NlZCBpbiBpcyBhIHBlcmNlbnRhZ2VcbmZ1bmN0aW9uIGlzUGVyY2VudGFnZShuKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBuID09PSBcInN0cmluZ1wiICYmIG4uaW5kZXhPZignJScpICE9IC0xO1xufVxuXG4vLyBGb3JjZSBhIGhleCB2YWx1ZSB0byBoYXZlIDIgY2hhcmFjdGVyc1xuZnVuY3Rpb24gcGFkMihjKSB7XG4gICAgcmV0dXJuIGMubGVuZ3RoID09IDEgPyAnMCcgKyBjIDogJycgKyBjO1xufVxuXG4vLyBSZXBsYWNlIGEgZGVjaW1hbCB3aXRoIGl0J3MgcGVyY2VudGFnZSB2YWx1ZVxuZnVuY3Rpb24gY29udmVydFRvUGVyY2VudGFnZShuKSB7XG4gICAgaWYgKG4gPD0gMSkge1xuICAgICAgICBuID0gKG4gKiAxMDApICsgXCIlXCI7XG4gICAgfVxuXG4gICAgcmV0dXJuIG47XG59XG5cbi8vIENvbnZlcnRzIGEgZGVjaW1hbCB0byBhIGhleCB2YWx1ZVxuZnVuY3Rpb24gY29udmVydERlY2ltYWxUb0hleChkKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQocGFyc2VGbG9hdChkKSAqIDI1NSkudG9TdHJpbmcoMTYpO1xufVxuLy8gQ29udmVydHMgYSBoZXggdmFsdWUgdG8gYSBkZWNpbWFsXG5mdW5jdGlvbiBjb252ZXJ0SGV4VG9EZWNpbWFsKGgpIHtcbiAgICByZXR1cm4gKHBhcnNlSW50RnJvbUhleChoKSAvIDI1NSk7XG59XG5cbnZhciBtYXRjaGVycyA9IChmdW5jdGlvbigpIHtcblxuICAgIC8vIDxodHRwOi8vd3d3LnczLm9yZy9UUi9jc3MzLXZhbHVlcy8jaW50ZWdlcnM+XG4gICAgdmFyIENTU19JTlRFR0VSID0gXCJbLVxcXFwrXT9cXFxcZCslP1wiO1xuXG4gICAgLy8gPGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtdmFsdWVzLyNudW1iZXItdmFsdWU+XG4gICAgdmFyIENTU19OVU1CRVIgPSBcIlstXFxcXCtdP1xcXFxkKlxcXFwuXFxcXGQrJT9cIjtcblxuICAgIC8vIEFsbG93IHBvc2l0aXZlL25lZ2F0aXZlIGludGVnZXIvbnVtYmVyLiAgRG9uJ3QgY2FwdHVyZSB0aGUgZWl0aGVyL29yLCBqdXN0IHRoZSBlbnRpcmUgb3V0Y29tZS5cbiAgICB2YXIgQ1NTX1VOSVQgPSBcIig/OlwiICsgQ1NTX05VTUJFUiArIFwiKXwoPzpcIiArIENTU19JTlRFR0VSICsgXCIpXCI7XG5cbiAgICAvLyBBY3R1YWwgbWF0Y2hpbmcuXG4gICAgLy8gUGFyZW50aGVzZXMgYW5kIGNvbW1hcyBhcmUgb3B0aW9uYWwsIGJ1dCBub3QgcmVxdWlyZWQuXG4gICAgLy8gV2hpdGVzcGFjZSBjYW4gdGFrZSB0aGUgcGxhY2Ugb2YgY29tbWFzIG9yIG9wZW5pbmcgcGFyZW5cbiAgICB2YXIgUEVSTUlTU0lWRV9NQVRDSDMgPSBcIltcXFxcc3xcXFxcKF0rKFwiICsgQ1NTX1VOSVQgKyBcIilbLHxcXFxcc10rKFwiICsgQ1NTX1VOSVQgKyBcIilbLHxcXFxcc10rKFwiICsgQ1NTX1VOSVQgKyBcIilcXFxccypcXFxcKT9cIjtcbiAgICB2YXIgUEVSTUlTU0lWRV9NQVRDSDQgPSBcIltcXFxcc3xcXFxcKF0rKFwiICsgQ1NTX1VOSVQgKyBcIilbLHxcXFxcc10rKFwiICsgQ1NTX1VOSVQgKyBcIilbLHxcXFxcc10rKFwiICsgQ1NTX1VOSVQgKyBcIilbLHxcXFxcc10rKFwiICsgQ1NTX1VOSVQgKyBcIilcXFxccypcXFxcKT9cIjtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJnYjogbmV3IFJlZ0V4cChcInJnYlwiICsgUEVSTUlTU0lWRV9NQVRDSDMpLFxuICAgICAgICByZ2JhOiBuZXcgUmVnRXhwKFwicmdiYVwiICsgUEVSTUlTU0lWRV9NQVRDSDQpLFxuICAgICAgICBoc2w6IG5ldyBSZWdFeHAoXCJoc2xcIiArIFBFUk1JU1NJVkVfTUFUQ0gzKSxcbiAgICAgICAgaHNsYTogbmV3IFJlZ0V4cChcImhzbGFcIiArIFBFUk1JU1NJVkVfTUFUQ0g0KSxcbiAgICAgICAgaHN2OiBuZXcgUmVnRXhwKFwiaHN2XCIgKyBQRVJNSVNTSVZFX01BVENIMyksXG4gICAgICAgIGhleDM6IC9eKFswLTlhLWZBLUZdezF9KShbMC05YS1mQS1GXXsxfSkoWzAtOWEtZkEtRl17MX0pJC8sXG4gICAgICAgIGhleDY6IC9eKFswLTlhLWZBLUZdezJ9KShbMC05YS1mQS1GXXsyfSkoWzAtOWEtZkEtRl17Mn0pJC8sXG4gICAgICAgIGhleDg6IC9eKFswLTlhLWZBLUZdezJ9KShbMC05YS1mQS1GXXsyfSkoWzAtOWEtZkEtRl17Mn0pKFswLTlhLWZBLUZdezJ9KSQvXG4gICAgfTtcbn0pKCk7XG5cbi8vIGBzdHJpbmdJbnB1dFRvT2JqZWN0YFxuLy8gUGVybWlzc2l2ZSBzdHJpbmcgcGFyc2luZy4gIFRha2UgaW4gYSBudW1iZXIgb2YgZm9ybWF0cywgYW5kIG91dHB1dCBhbiBvYmplY3Rcbi8vIGJhc2VkIG9uIGRldGVjdGVkIGZvcm1hdC4gIFJldHVybnMgYHsgciwgZywgYiB9YCBvciBgeyBoLCBzLCBsIH1gIG9yIGB7IGgsIHMsIHZ9YFxuZnVuY3Rpb24gc3RyaW5nSW5wdXRUb09iamVjdChjb2xvcikge1xuXG4gICAgY29sb3IgPSBjb2xvci5yZXBsYWNlKHRyaW1MZWZ0LCcnKS5yZXBsYWNlKHRyaW1SaWdodCwgJycpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFyIG5hbWVkID0gZmFsc2U7XG4gICAgaWYgKG5hbWVzW2NvbG9yXSkge1xuICAgICAgICBjb2xvciA9IG5hbWVzW2NvbG9yXTtcbiAgICAgICAgbmFtZWQgPSB0cnVlO1xuICAgIH1cbiAgICBlbHNlIGlmIChjb2xvciA9PSAndHJhbnNwYXJlbnQnKSB7XG4gICAgICAgIHJldHVybiB7IHI6IDAsIGc6IDAsIGI6IDAsIGE6IDAsIGZvcm1hdDogXCJuYW1lXCIgfTtcbiAgICB9XG5cbiAgICAvLyBUcnkgdG8gbWF0Y2ggc3RyaW5nIGlucHV0IHVzaW5nIHJlZ3VsYXIgZXhwcmVzc2lvbnMuXG4gICAgLy8gS2VlcCBtb3N0IG9mIHRoZSBudW1iZXIgYm91bmRpbmcgb3V0IG9mIHRoaXMgZnVuY3Rpb24gLSBkb24ndCB3b3JyeSBhYm91dCBbMCwxXSBvciBbMCwxMDBdIG9yIFswLDM2MF1cbiAgICAvLyBKdXN0IHJldHVybiBhbiBvYmplY3QgYW5kIGxldCB0aGUgY29udmVyc2lvbiBmdW5jdGlvbnMgaGFuZGxlIHRoYXQuXG4gICAgLy8gVGhpcyB3YXkgdGhlIHJlc3VsdCB3aWxsIGJlIHRoZSBzYW1lIHdoZXRoZXIgdGhlIHRpbnljb2xvciBpcyBpbml0aWFsaXplZCB3aXRoIHN0cmluZyBvciBvYmplY3QuXG4gICAgdmFyIG1hdGNoO1xuICAgIGlmICgobWF0Y2ggPSBtYXRjaGVycy5yZ2IuZXhlYyhjb2xvcikpKSB7XG4gICAgICAgIHJldHVybiB7IHI6IG1hdGNoWzFdLCBnOiBtYXRjaFsyXSwgYjogbWF0Y2hbM10gfTtcbiAgICB9XG4gICAgaWYgKChtYXRjaCA9IG1hdGNoZXJzLnJnYmEuZXhlYyhjb2xvcikpKSB7XG4gICAgICAgIHJldHVybiB7IHI6IG1hdGNoWzFdLCBnOiBtYXRjaFsyXSwgYjogbWF0Y2hbM10sIGE6IG1hdGNoWzRdIH07XG4gICAgfVxuICAgIGlmICgobWF0Y2ggPSBtYXRjaGVycy5oc2wuZXhlYyhjb2xvcikpKSB7XG4gICAgICAgIHJldHVybiB7IGg6IG1hdGNoWzFdLCBzOiBtYXRjaFsyXSwgbDogbWF0Y2hbM10gfTtcbiAgICB9XG4gICAgaWYgKChtYXRjaCA9IG1hdGNoZXJzLmhzbGEuZXhlYyhjb2xvcikpKSB7XG4gICAgICAgIHJldHVybiB7IGg6IG1hdGNoWzFdLCBzOiBtYXRjaFsyXSwgbDogbWF0Y2hbM10sIGE6IG1hdGNoWzRdIH07XG4gICAgfVxuICAgIGlmICgobWF0Y2ggPSBtYXRjaGVycy5oc3YuZXhlYyhjb2xvcikpKSB7XG4gICAgICAgIHJldHVybiB7IGg6IG1hdGNoWzFdLCBzOiBtYXRjaFsyXSwgdjogbWF0Y2hbM10gfTtcbiAgICB9XG4gICAgaWYgKChtYXRjaCA9IG1hdGNoZXJzLmhleDguZXhlYyhjb2xvcikpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhOiBjb252ZXJ0SGV4VG9EZWNpbWFsKG1hdGNoWzFdKSxcbiAgICAgICAgICAgIHI6IHBhcnNlSW50RnJvbUhleChtYXRjaFsyXSksXG4gICAgICAgICAgICBnOiBwYXJzZUludEZyb21IZXgobWF0Y2hbM10pLFxuICAgICAgICAgICAgYjogcGFyc2VJbnRGcm9tSGV4KG1hdGNoWzRdKSxcbiAgICAgICAgICAgIGZvcm1hdDogbmFtZWQgPyBcIm5hbWVcIiA6IFwiaGV4OFwiXG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmICgobWF0Y2ggPSBtYXRjaGVycy5oZXg2LmV4ZWMoY29sb3IpKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcjogcGFyc2VJbnRGcm9tSGV4KG1hdGNoWzFdKSxcbiAgICAgICAgICAgIGc6IHBhcnNlSW50RnJvbUhleChtYXRjaFsyXSksXG4gICAgICAgICAgICBiOiBwYXJzZUludEZyb21IZXgobWF0Y2hbM10pLFxuICAgICAgICAgICAgZm9ybWF0OiBuYW1lZCA/IFwibmFtZVwiIDogXCJoZXhcIlxuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAoKG1hdGNoID0gbWF0Y2hlcnMuaGV4My5leGVjKGNvbG9yKSkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHI6IHBhcnNlSW50RnJvbUhleChtYXRjaFsxXSArICcnICsgbWF0Y2hbMV0pLFxuICAgICAgICAgICAgZzogcGFyc2VJbnRGcm9tSGV4KG1hdGNoWzJdICsgJycgKyBtYXRjaFsyXSksXG4gICAgICAgICAgICBiOiBwYXJzZUludEZyb21IZXgobWF0Y2hbM10gKyAnJyArIG1hdGNoWzNdKSxcbiAgICAgICAgICAgIGZvcm1hdDogbmFtZWQgPyBcIm5hbWVcIiA6IFwiaGV4XCJcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbi8vIE5vZGU6IEV4cG9ydCBmdW5jdGlvblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHRpbnljb2xvcjtcbn1cbi8vIEFNRC9yZXF1aXJlanM6IERlZmluZSB0aGUgbW9kdWxlXG5lbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24gKCkge3JldHVybiB0aW55Y29sb3I7fSk7XG59XG4vLyBCcm93c2VyOiBFeHBvc2UgdG8gd2luZG93XG5lbHNlIHtcbiAgICB3aW5kb3cudGlueWNvbG9yID0gdGlueWNvbG9yO1xufVxuXG59KSgpO1xuIiwiLyohXG4qIFRpbnlHcmFkaWVudFxuKiBDb3B5cmlnaHQgMjAxNCBEYW1pZW4gXCJNaXN0aWNcIiBTb3JlbCAoaHR0cDovL3d3dy5zdHJhbmdlcGxhbmV0LmZyKVxuKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVQpXG4qL1xuXG4oZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCd0aW55Y29sb3IyJykpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsndGlueWNvbG9yJ10sIGZhY3RvcnkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcm9vdC50aW55Z3JhZGllbnQgPSBmYWN0b3J5KHJvb3QudGlueWNvbG9yKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uKHRpbnljb2xvcikge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIFV0aWxzID0ge1xuICAgICAgICByZ2JhX21heDogeyByOiAyNTYsIGc6IDI1NiwgYjogMjU2LCBhOiAxIH0sXG4gICAgICAgIGhzdmFfbWF4OiB7IGg6IDM2MCwgczogMSwgdjogMSwgYTogMSB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMaW5lYXJseSBjb21wdXRlIHRoZSBzdGVwIHNpemUgYmV0d2VlbiBzdGFydCBhbmQgZW5kIChub3Qgbm9ybWFsaXplZClcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHN0YXJ0IC0gcmdiYSBvciBoc3ZhXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbmQgLSByZ2JhIG9yIGhzdmFcbiAgICAgICAgICogQHBhcmFtIHtJbnRlZ2VyfSBzdGVwcyAtIG51bWJlciBvZiBkZXNpcmVkIHN0ZXBzXG4gICAgICAgICAqIEByZXR1cm4ge09iamVjdH0gcmdiYSBvciBoc3ZhXG4gICAgICAgICAqL1xuICAgICAgICBzdGVwaXplOiBmdW5jdGlvbihzdGFydCwgZW5kLCBzdGVwcykge1xuICAgICAgICAgICAgdmFyIHN0ZXAgPSB7fTtcblxuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBzdGFydCkge1xuICAgICAgICAgICAgICAgIGlmIChzdGFydC5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgICAgICAgICBzdGVwW2tdID0gKGVuZFtrXS1zdGFydFtrXSkgLyBzdGVwcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdGVwO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb21wdXRlIHRoZSBmaW5hbCBzdGVwIGNvbG9yXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzdGVwIC0gcmdiYSBvciBoc3ZhIGZyb20gYHN0ZXBpemVgXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzdGFydCAtIHJnYmEgb3IgaHN2YVxuICAgICAgICAgKiBAcGFyYW0ge0ludGVnZXJ9IGkgLSBjb2xvciBpbmRleFxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gbWF4IC0gcmdiYSBvciBoc3ZhIG9mIG1heGltdW0gdmFsdWVzIGZvciBlYWNoIGNoYW5uZWxcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fSByZ2JhIG9yIGhzdmFcbiAgICAgICAgICovXG4gICAgICAgIGludGVycG9sYXRlOiBmdW5jdGlvbihzdGVwLCBzdGFydCwgaSwgbWF4KSB7XG4gICAgICAgICAgICB2YXIgY29sb3IgPSB7fTtcblxuICAgICAgICAgICAgZm9yICh2YXIgayBpbiBzdGFydCkge1xuICAgICAgICAgICAgICAgIGlmIChzdGFydC5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcltrXSA9IHN0ZXBba10gKiBpICsgc3RhcnRba107XG4gICAgICAgICAgICAgICAgICAgIGNvbG9yW2tdID0gY29sb3Jba108MCA/IGNvbG9yW2tdK21heFtrXSA6ICggbWF4W2tdIT0xID8gY29sb3Jba10lbWF4W2tdIDogY29sb3Jba10gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjb2xvcjtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogR2VuZXJhdGUgZ3JhZGllbnQgd2l0aCBSR0JhIGludGVycG9sYXRpb25cbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHN0b3AxXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzdG9wMlxuICAgICAgICAgKiBAcGFyYW0ge0ludGVnZXJ9IHN0ZXBzXG4gICAgICAgICAqIEBwYXJhbSB7dGlueWNvbG9yW119IGNvbG9yMSBpbmNsdWRlZCwgY29sb3IyIGV4Y2x1ZGVkXG4gICAgICAgICAqL1xuICAgICAgICByZ2I6IGZ1bmN0aW9uKHN0b3AxLCBzdG9wMiwgc3RlcHMpIHtcbiAgICAgICAgICAgIHZhciBzdGFydCA9IHN0b3AxLmNvbG9yLnRvUmdiKCksXG4gICAgICAgICAgICAgICAgZW5kID0gc3RvcDIuY29sb3IudG9SZ2IoKSxcbiAgICAgICAgICAgICAgICBncmFkaWVudCA9IFtzdG9wMS5jb2xvcl0sXG4gICAgICAgICAgICAgICAgc3RlcCA9IFV0aWxzLnN0ZXBpemUoc3RhcnQsIGVuZCwgc3RlcHMpLFxuICAgICAgICAgICAgICAgIGNvbG9yO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpPTE7IGk8c3RlcHM7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbG9yID0gVXRpbHMuaW50ZXJwb2xhdGUoc3RlcCwgc3RhcnQsIGksIFV0aWxzLnJnYmFfbWF4KTtcbiAgICAgICAgICAgICAgICBncmFkaWVudC5wdXNoKHRpbnljb2xvcihjb2xvcikpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZ3JhZGllbnQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdlbmVyYXRlIGdyYWRpZW50IHdpdGggSFNWYSBpbnRlcnBvbGF0aW9uXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzdG9wMVxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gc3RvcDJcbiAgICAgICAgICogQHBhcmFtIHtJbnRlZ2VyfSBzdGVwc1xuICAgICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IHRyaWdvbm9tZXRyaWMgLSB0cnVlIHRvIHN0ZXAgaW4gdHJpZ29ub21ldHJpYyBvcmRlclxuICAgICAgICAgKiBAcGFyYW0ge3Rpbnljb2xvcltdfSBjb2xvcjEgaW5jbHVkZWQsIGNvbG9yMiBleGNsdWRlZFxuICAgICAgICAgKi9cbiAgICAgICAgaHN2OiBmdW5jdGlvbihzdG9wMSwgc3RvcDIsIHN0ZXBzLCB0cmlnb25vbWV0cmljKSB7XG4gICAgICAgICAgICB2YXIgc3RhcnQgPSBzdG9wMS5jb2xvci50b0hzdigpLFxuICAgICAgICAgICAgICAgIGVuZCA9IHN0b3AyLmNvbG9yLnRvSHN2KCksXG4gICAgICAgICAgICAgICAgZ3JhZGllbnQgPSBbc3RvcDEuY29sb3JdLFxuICAgICAgICAgICAgICAgIHN0ZXAgPSBVdGlscy5zdGVwaXplKHN0YXJ0LCBlbmQsIHN0ZXBzKSxcbiAgICAgICAgICAgICAgICBkaWZmLCBjb2xvcjtcblxuICAgICAgICAgICAgLy8gcmVjb21wdXRlIGh1ZVxuICAgICAgICAgICAgaWYgKChzdGFydC5oIDw9IGVuZC5oICYmICF0cmlnb25vbWV0cmljKSB8fCAoc3RhcnQuaCA+PSBlbmQuaCAmJiB0cmlnb25vbWV0cmljKSkge1xuICAgICAgICAgICAgICAgIGRpZmYgPSBlbmQuaC1zdGFydC5oO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodHJpZ29ub21ldHJpYykge1xuICAgICAgICAgICAgICAgIGRpZmYgPSAzNjAtZW5kLmgrc3RhcnQuaDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpZmYgPSAzNjAtc3RhcnQuaCtlbmQuaDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0ZXAuaCA9IE1hdGgucG93KC0xLCB0cmlnb25vbWV0cmljKSAqIE1hdGguYWJzKGRpZmYpKjEuMCAvIHN0ZXBzO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpPTE7IGk8c3RlcHM7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbG9yID0gVXRpbHMuaW50ZXJwb2xhdGUoc3RlcCwgc3RhcnQsIGksIFV0aWxzLmhzdmFfbWF4KTtcbiAgICAgICAgICAgICAgICBncmFkaWVudC5wdXNoKHRpbnljb2xvcihjb2xvcikpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZ3JhZGllbnQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbXB1dGUgc3Vic3RlcHMgYmV0d2VlbiBlYWNoIHN0b3BzXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0W119IHN0b3BzXG4gICAgICAgICAqIEBwYXJhbSB7SW50ZWdlcn0gc3RlcHNcbiAgICAgICAgICogQHJldHVybiB7SW50ZWdlcltdfVxuICAgICAgICAgKi9cbiAgICAgICAgc3Vic3RlcHM6IGZ1bmN0aW9uKHN0b3BzLCBzdGVwcykge1xuICAgICAgICAgICAgdmFyIGwgPSBzdG9wcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIC8vIHZhbGlkYXRpb25cbiAgICAgICAgICAgIHN0ZXBzID0gcGFyc2VJbnQoc3RlcHMpO1xuXG4gICAgICAgICAgICBpZiAoaXNOYU4oc3RlcHMpIHx8IHN0ZXBzIDwgMikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBudW1iZXIgb2Ygc3RlcHMgKDwgMiknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdGVwcyA8IGwpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ051bWJlciBvZiBzdGVwcyBjYW5ub3QgYmUgaW5mZXJpb3IgdG8gbnVtYmVyIG9mIHN0b3BzJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNvbXB1dGUgc3Vic3RlcHMgZnJvbSBzdG9wIHBvc2l0aW9uc1xuICAgICAgICAgICAgdmFyIHN1YnN0ZXBzID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGk9MTsgaTxsOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RlcCA9IChzdGVwcy0xKSAqIChzdG9wc1tpXS5wb3Mtc3RvcHNbaS0xXS5wb3MpO1xuICAgICAgICAgICAgICAgIHN1YnN0ZXBzLnB1c2goTWF0aC5tYXgoMSwgTWF0aC5yb3VuZChzdGVwKSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBhZGp1c3QgbnVtYmVyIG9mIHN0ZXBzXG4gICAgICAgICAgICB2YXIgdG90YWxTdWJzdGVwcyA9IDE7XG4gICAgICAgICAgICBmb3IgKHZhciBuPWwtMTsgbi0tOykgdG90YWxTdWJzdGVwcys9IHN1YnN0ZXBzW25dO1xuXG4gICAgICAgICAgICB3aGlsZSAodG90YWxTdWJzdGVwcyAhPSBzdGVwcykge1xuICAgICAgICAgICAgICAgIGlmICh0b3RhbFN1YnN0ZXBzIDwgc3RlcHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1pbiA9IE1hdGgubWluLmFwcGx5KG51bGwsIHN1YnN0ZXBzKTtcbiAgICAgICAgICAgICAgICAgICAgc3Vic3RlcHNbc3Vic3RlcHMuaW5kZXhPZihtaW4pXSsrO1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFN1YnN0ZXBzKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF4ID0gTWF0aC5tYXguYXBwbHkobnVsbCwgc3Vic3RlcHMpO1xuICAgICAgICAgICAgICAgICAgICBzdWJzdGVwc1tzdWJzdGVwcy5pbmRleE9mKG1heCldLS07XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsU3Vic3RlcHMtLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdWJzdGVwcztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAY2xhc3MgdGlueWdyYWRpZW50XG4gICAgICogQHBhcmFtIHttaXhlZH0gc3RvcHNcbiAgICAgKi9cbiAgICB2YXIgVGlueUdyYWRpZW50ID0gZnVuY3Rpb24oc3RvcHMpIHtcbiAgICAgICAgLy8gdmFyYXJnc1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICBpZiAoIShhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wic3RvcHNcIiBpcyBub3QgYW4gYXJyYXknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0b3BzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc3RvcHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgd2UgYXJlIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLCBjYWxsIHVzaW5nIG5ldyBpbnN0ZWFkXG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBUaW55R3JhZGllbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFRpbnlHcmFkaWVudChzdG9wcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB2YWxpZGF0aW9uXG4gICAgICAgIGlmIChzdG9wcy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgbnVtYmVyIG9mIHN0b3BzICg8IDIpJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaGF2aW5nUG9zaXRpb25zID0gc3RvcHNbMF0ucG9zICE9PSB1bmRlZmluZWQsXG4gICAgICAgICAgICBsID0gc3RvcHMubGVuZ3RoLFxuICAgICAgICAgICAgcCA9IC0xO1xuICAgICAgICAvLyBjcmVhdGUgdGlueWNvbG9yIG9iamVjdHMgYW5kIGNsZWFuIHBvc2l0aW9uc1xuICAgICAgICB0aGlzLnN0b3BzID0gc3RvcHMubWFwKGZ1bmN0aW9uKHN0b3AsIGkpIHtcbiAgICAgICAgICAgIHZhciBoYXNQb3NpdGlvbiA9IHN0b3AucG9zICE9PSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAoaGF2aW5nUG9zaXRpb25zIF4gaGFzUG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBtaXggcG9zaXRpb25uZWQgYW5kIG5vdCBwb3Npb25uZWQgY29sb3Igc3RvcHMnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGhhc1Bvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgc3RvcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IHRpbnljb2xvcihzdG9wLmNvbG9yKSxcbiAgICAgICAgICAgICAgICAgICAgcG9zOiBzdG9wLnBvc1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpZiAoc3RvcC5wb3MgPCAwIHx8IHN0b3AucG9zID4gMSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbG9yIHN0b3BzIHBvc2l0aW9ucyBtdXN0IGJlIGJldHdlZW4gMCBhbmQgMScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChzdG9wLnBvcyA8PSBwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29sb3Igc3RvcHMgcG9zaXRpb25zIGFyZSBub3Qgb3JkZXJlZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwID0gc3RvcC5wb3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdG9wID0ge1xuICAgICAgICAgICAgICAgICAgICBjb2xvcjogdGlueWNvbG9yKHN0b3ApLFxuICAgICAgICAgICAgICAgICAgICBwb3M6IGkvKGwtMSlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc3RvcDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RvcHNbMF0ucG9zICE9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BzLnVuc2hpZnQoe1xuICAgICAgICAgICAgICAgIGNvbG9yOiB0aGlzLnN0b3BzWzBdLmNvbG9yLFxuICAgICAgICAgICAgICAgIHBvczogMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc3RvcHNbdGhpcy5zdG9wcy5sZW5ndGgtMV0ucG9zICE9PSAxKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BzLnB1c2goe1xuICAgICAgICAgICAgICAgIGNvbG9yOiB0aGlzLnN0b3BzW3RoaXMuc3RvcHMubGVuZ3RoLTFdLmNvbG9yLFxuICAgICAgICAgICAgICAgIHBvczogMVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIG5ldyBpbnN0YW5jZSB3aXRoIHJldmVyc2VkIHN0b3BzXG4gICAgICogQHJldHVybiB7dGlueWdyYWRpZW50fVxuICAgICAqL1xuICAgIFRpbnlHcmFkaWVudC5wcm90b3R5cGUucmV2ZXJzZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc3RvcHMgPSBbXTtcblxuICAgICAgICB0aGlzLnN0b3BzLmZvckVhY2goZnVuY3Rpb24oc3RvcCkge1xuICAgICAgICAgICAgc3RvcHMucHVzaCh7XG4gICAgICAgICAgICAgICAgY29sb3I6IHN0b3AuY29sb3IsXG4gICAgICAgICAgICAgICAgcG9zOiAxIC0gc3RvcC5wb3NcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbmV3IFRpbnlHcmFkaWVudChzdG9wcy5yZXZlcnNlKCkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBncmFkaWVudCB3aXRoIFJHQmEgaW50ZXJwb2xhdGlvblxuICAgICAqIEBwYXJhbSB7SW50ZWdlcn0gc3RlcHNcbiAgICAgKiBAcmV0dXJuIHt0aW55Y29sb3JbXX1cbiAgICAgKi9cbiAgICBUaW55R3JhZGllbnQucHJvdG90eXBlLnJnYiA9IGZ1bmN0aW9uKHN0ZXBzKSB7XG4gICAgICAgIHZhciBzdWJzdGVwcyA9IFV0aWxzLnN1YnN0ZXBzKHRoaXMuc3RvcHMsIHN0ZXBzKSxcbiAgICAgICAgICAgIGdyYWRpZW50ID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgaT0wLCBsPXRoaXMuc3RvcHMubGVuZ3RoOyBpPGwtMTsgaSsrKSB7XG4gICAgICAgICAgICBncmFkaWVudCA9IGdyYWRpZW50LmNvbmNhdChVdGlscy5yZ2IodGhpcy5zdG9wc1tpXSwgdGhpcy5zdG9wc1tpKzFdLCBzdWJzdGVwc1tpXSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ3JhZGllbnQucHVzaCh0aGlzLnN0b3BzW2wtMV0uY29sb3IpO1xuXG4gICAgICAgIHJldHVybiBncmFkaWVudDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgZ3JhZGllbnQgd2l0aCBIU1ZhIGludGVycG9sYXRpb25cbiAgICAgKiBAcGFyYW0ge0ludGVnZXJ9IHN0ZXBzXG4gICAgICogQHBhcmFtIHtCb29sZWFufFN0cmluZ30gW21vZGU9ZmFsc2VdXG4gICAgICogICAgLSBmYWxzZSB0byBzdGVwIGluIGNsb2Nrd2lzZVxuICAgICAqICAgIC0gdHJ1ZSB0byBzdGVwIGluIHRyaWdvbm9tZXRyaWMgb3JkZXJcbiAgICAgKiAgICAtICdzaG9ydCcgdG8gdXNlIHRoZSBzaG9ydGVzdCB3YXlcbiAgICAgKiAgICAtICdsb25nJyB0byB1c2UgdGhlIGxvbmdlc3Qgd2F5XG4gICAgICogQHJldHVybiB7dGlueWNvbG9yW119XG4gICAgICovXG4gICAgVGlueUdyYWRpZW50LnByb3RvdHlwZS5oc3YgPSBmdW5jdGlvbihzdGVwcywgbW9kZSkge1xuICAgICAgICB2YXIgc3Vic3RlcHMgPSBVdGlscy5zdWJzdGVwcyh0aGlzLnN0b3BzLCBzdGVwcyksXG4gICAgICAgICAgICB0cmlnb25vbWV0cmljID0gbW9kZSA9PT0gdHJ1ZSxcbiAgICAgICAgICAgIHBhcmFtZXRyaXplZCA9IHR5cGVvZiBtb2RlID09PSAnc3RyaW5nJyxcbiAgICAgICAgICAgIGdyYWRpZW50ID0gW10sXG4gICAgICAgICAgICBzdGFydCwgZW5kLCB0cmlnO1xuXG4gICAgICAgIGZvciAodmFyIGk9MCwgbD10aGlzLnN0b3BzLmxlbmd0aDsgaTxsLTE7IGkrKykge1xuICAgICAgICAgICAgc3RhcnQgPSB0aGlzLnN0b3BzW2ldLmNvbG9yLnRvSHN2KCk7XG4gICAgICAgICAgICBlbmQgPSB0aGlzLnN0b3BzW2krMV0uY29sb3IudG9Ic3YoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChwYXJhbWV0cml6ZWQpIHtcbiAgICAgICAgICAgICAgICB0cmlnID0gKHN0YXJ0LmggPCBlbmQuaCAmJiBlbmQuaC1zdGFydC5oIDwgMTgwKSB8fCAoc3RhcnQuaCA+IGVuZC5oICYmIHN0YXJ0LmgtZW5kLmggPiAxODApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyByZ2IgaW50ZXJwb2xhdGlvbiBpZiBvbmUgb2YgdGhlIHN0ZXBzIGluIGdyYXlzY2FsZVxuICAgICAgICAgICAgaWYgKHN0YXJ0LnM9PT0wIHx8IGVuZC5zPT09MCkge1xuICAgICAgICAgICAgICAgIGdyYWRpZW50ID0gZ3JhZGllbnQuY29uY2F0KFV0aWxzLnJnYih0aGlzLnN0b3BzW2ldLCB0aGlzLnN0b3BzW2krMV0sIHN1YnN0ZXBzW2ldKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBncmFkaWVudCA9IGdyYWRpZW50LmNvbmNhdChVdGlscy5oc3YodGhpcy5zdG9wc1tpXSwgdGhpcy5zdG9wc1tpKzFdLCBzdWJzdGVwc1tpXSxcbiAgICAgICAgICAgICAgICAgIChtb2RlPT09J2xvbmcnICYmIHRyaWcpIHx8IChtb2RlPT09J3Nob3J0JyAmJiAhdHJpZykgfHwgKCFwYXJhbWV0cml6ZWQgJiYgdHJpZ29ub21ldHJpYylcbiAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGdyYWRpZW50LnB1c2godGhpcy5zdG9wc1tsLTFdLmNvbG9yKTtcblxuICAgICAgICByZXR1cm4gZ3JhZGllbnQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIENTUzMgY29tbWFuZCAobm8gcHJlZml4KSBmb3IgdGhpcyBncmFkaWVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBbbW9kZT1saW5lYXJdIC0gJ2xpbmVhcicgb3IgJ3JhZGlhbCdcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2RpcmVjdGlvbl0gLSBkZWZhdWx0IGlzICd0byByaWdodCcgb3IgJ2VsbGlwc2UgYXQgY2VudGVyJ1xuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBUaW55R3JhZGllbnQucHJvdG90eXBlLmNzcyA9IGZ1bmN0aW9uKG1vZGUsIGRpcmVjdGlvbikge1xuICAgICAgICBtb2RlID0gbW9kZSB8fCAnbGluZWFyJztcbiAgICAgICAgZGlyZWN0aW9uID0gZGlyZWN0aW9uIHx8IChtb2RlPT0nbGluZWFyJyA/ICd0byByaWdodCcgOiAnZWxsaXBzZSBhdCBjZW50ZXInKTtcblxuICAgICAgICB2YXIgY3NzID0gbW9kZSArICctZ3JhZGllbnQoJyArIGRpcmVjdGlvbjtcbiAgICAgICAgdGhpcy5zdG9wcy5mb3JFYWNoKGZ1bmN0aW9uKHN0b3ApIHtcbiAgICAgICAgICAgIGNzcys9ICcsICcgKyBzdG9wLmNvbG9yLnRvUmdiU3RyaW5nKCkgKyAnICcgKyAoc3RvcC5wb3MqMTAwKSArICclJztcbiAgICAgICAgfSk7XG4gICAgICAgIGNzcys9ICcpJztcbiAgICAgICAgcmV0dXJuIGNzcztcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIGFuZCBjcmVhdGUgZ3JhZGllbnQgd2l0aCBSR0JhIGludGVycG9sYXRpb25cbiAgICAgKiBAc2VlIFRpbnlHcmFkaWVudDo6cmdiXG4gICAgICovXG4gICAgVGlueUdyYWRpZW50LnJnYiA9IGZ1bmN0aW9uKGNvbG9ycywgc3RlcHMpIHtcbiAgICAgICAgY29sb3JzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgc3RlcHMgPSBjb2xvcnMucG9wKCk7XG5cbiAgICAgICAgcmV0dXJuIFRpbnlHcmFkaWVudC5hcHBseShudWxsLCBjb2xvcnMpLnJnYihzdGVwcyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgYW5kIGNyZWF0ZSBncmFkaWVudCB3aXRoIEhTVmEgaW50ZXJwb2xhdGlvblxuICAgICAqIEBzZWUgVGlueUdyYWRpZW50Ojpoc3ZcbiAgICAgKi9cbiAgICBUaW55R3JhZGllbnQuaHN2ID0gZnVuY3Rpb24oY29sb3JzLCBzdGVwcywgbW9kZSkge1xuICAgICAgICBjb2xvcnMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICBtb2RlID0gY29sb3JzLnBvcCgpO1xuICAgICAgICBzdGVwcyA9IGNvbG9ycy5wb3AoKTtcblxuICAgICAgICByZXR1cm4gVGlueUdyYWRpZW50LmFwcGx5KG51bGwsIGNvbG9ycykuaHN2KHN0ZXBzLCBtb2RlKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBhbmQgZ2VuZXJhdGUgQ1NTMyBjb21tYW5kIGZvciBncmFkaWVudFxuICAgICAqIEBzZWUgVGlueUdyYWRpZW50Ojpjc3NcbiAgICAgKi9cbiAgICBUaW55R3JhZGllbnQuY3NzID0gZnVuY3Rpb24oY29sb3JzLCBtb2RlLCBkaXJlY3Rpb24pIHtcbiAgICAgICAgY29sb3JzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgZGlyZWN0aW9uID0gY29sb3JzLnBvcCgpO1xuICAgICAgICBtb2RlID0gY29sb3JzLnBvcCgpO1xuXG4gICAgICAgIHJldHVybiBUaW55R3JhZGllbnQuYXBwbHkobnVsbCwgY29sb3JzKS5jc3MobW9kZSwgZGlyZWN0aW9uKTtcbiAgICB9O1xuXG5cbiAgICAvLyBleHBvcnRcbiAgICByZXR1cm4gVGlueUdyYWRpZW50O1xufSkpOyIsInZhciBQcm9maWxlciA9IHJlcXVpcmUoJy4vcHJvZmlsZXInKTtcblxudmFyIEFwcCA9IHtcbiAgZ2VuZXJhdGVfdGhyZWFkZWQ6IGZ1bmN0aW9uKG0pIHtcbiAgICB2YXIgbnVtX2JpbnMgPSBtLm51bV90aHJlYWRzIHx8IDE7XG5cbiAgICB2YXIgbGVuID0gbS5udW1fcGl4ZWxzO1xuICAgIHZhciBiaW5fc2l6ZSA9IE1hdGguY2VpbChsZW4gLyBudW1fYmlucyk7XG5cbiAgICB2YXIgY3V0X3BvaW50cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IGJpbl9zaXplKSB7XG4gICAgICBjdXRfcG9pbnRzLnB1c2goW2ksIGkgKyBiaW5fc2l6ZV0pO1xuICAgIH1cblxuICAgIHZhciB0MSwgdDI7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIG0uQyA9IGRhdGE7XG5cbiAgICAgICAgdDEgPSBOdW1iZXIobmV3IERhdGUoKSk7XG4gICAgICAgIHJldHVybiBBcHAucnVuX2dlbmVyYXRlX3dvcmtlcihtLCBjdXRfcG9pbnRzKTtcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHQyID0gTnVtYmVyKG5ldyBEYXRlKCkpO1xuICAgICAgICB2YXIgdHRpbWUgPSAodDIgLSB0MSk7XG4gICAgICAgIHZhciB0dG90YWwgPSAodHRpbWUgLyAxMDAwKVxuICAgICAgICBjb25zb2xlLmxvZyhcInR0b3RhbCBnZW5lcmF0ZTogXCIgKyB0dG90YWwpO1xuXG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgfSlcbiAgICA7XG4gIH0sXG5cbiAgcnVuX2dlbmVyYXRlX3dvcmtlcjogZnVuY3Rpb24obSwgY3V0X3BvaW50cykge1xuICAgIHZhciBudW1faXRlciA9IG0ubnVtX2l0ZXIgfHwgMTA7XG4gICAgdmFyIG51bV9waXhlbHMgPSBtLm51bV9waXhlbHMgfHwgMTA7XG5cbiAgICB2YXIgd29ya2VyVGFza3MgPSBjdXRfcG9pbnRzLm1hcChmdW5jdGlvbihjcCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICB2YXIgbXlXb3JrZXIgPSBuZXcgV29ya2VyKCdhc3NldHMvd29ya2VyX2dlbmVyYXRlLmpzJyk7XG5cbiAgICAgICAgbXlXb3JrZXIub25tZXNzYWdlID0gcmVzb2x2ZTtcblxuICAgICAgICBteVdvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgeV9taW46IGNwWzBdLFxuICAgICAgICAgIHlfbWF4OiBjcFsxXSxcbiAgICAgICAgICBudW1faXRlcjogbnVtX2l0ZXIsXG4gICAgICAgICAgbnVtX3BpeGVsczogbnVtX3BpeGVscyxcbiAgICAgICAgICBncmFkaWVudF9kZWY6IG0uZ3JhZGllbnRfZGVmLFxuICAgICAgICAgIGdyYWRpZW50X3Byb2ZpbGU6IG0uZ3JhZGllbnRfcHJvZmlsZSxcbiAgICAgICAgICBncmFkaWVudF9jb3VudGVyX2Nsb2Nrd2lzZTogbS5ncmFkaWVudF9jb3VudGVyX2Nsb2Nrd2lzZSxcbiAgICAgICAgICBlZGdlX2xlZnQ6IG0uZWRnZV9sZWZ0LFxuICAgICAgICAgIGVkZ2VfcmlnaHQ6IG0uZWRnZV9yaWdodCxcbiAgICAgICAgICBlZGdlX3RvcDogbS5lZGdlX3RvcCxcbiAgICAgICAgICBlZGdlX2JvdHRvbTogbS5lZGdlX2JvdHRvbSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciByZXN1bHRQcm9taXNlID0gUHJvbWlzZS5hbGwod29ya2VyVGFza3MpLnRoZW4oZnVuY3Rpb24obWVzc2FnZXMpIHtcbiAgICAgIHZhciBsZW5ndGggPSBudW1fcGl4ZWxzICogbnVtX3BpeGVscyAqIDQ7XG4gICAgICB2YXIgaW1hZ2VEYXRhID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KGxlbmd0aCk7XG5cbiAgICAgIHZhciBpID0gMDtcbiAgICAgIG1lc3NhZ2VzLnJldmVyc2UoKS5mb3JFYWNoKGZ1bmN0aW9uKGUsIHNlY3Rpb24pIHtcbiAgICAgICAgdmFyIGFyciA9IG5ldyBVaW50OENsYW1wZWRBcnJheShlLmRhdGEpO1xuICAgICAgICB2YXIgbiA9IGFyci5sZW5ndGg7XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBuOyBqKyspIHtcbiAgICAgICAgICBpbWFnZURhdGFbaSsrXSA9IGFycltqXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGltYWdlRGF0YS5sZW5ndGhcblxuICAgICAgcmV0dXJuIGltYWdlRGF0YTtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHRQcm9taXNlO1xuICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcHA7XG4iLCJ2YXIgQ29tcGxleCA9IHJlcXVpcmUoJy4vY29tcGxleF9oZWFkZXInKTtcbnZhciBJbWFnaW5hcnkgPSByZXF1aXJlKCcuL2ltYWdpbmFyeV9hcnJheScpO1xuXG5Db21wbGV4LmVxID0gKEEsIEIpID0+IHtcbiAgcmV0dXJuIChcbiAgICBBWzBdID09PSBCWzBdICYmXG4gICAgQVsxXSA9PT0gQlsxXVxuICApO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBBZGRpdGlvblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5Db21wbGV4LmFkZFJlYWwgPSAoeiwgcikgPT4ge1xuICByZXR1cm4gW3pbMF0gKyByLCB6WzFdXTtcbn07XG5cbkNvbXBsZXguYWRkSW1hZ2luYXJ5ID0gKHosIGopID0+IHtcbiAgcmV0dXJuIFt6WzBdLCBJbWFnaW5hcnkuYWRkSW1hZ2luYXJ5KHpbMV0sIGopXTtcbn07XG5cbkNvbXBsZXguYWRkQ29tcGxleCA9IChBLCBCKSA9PiB7XG4gIHJldHVybiBbQVswXSArIEJbMF0sIEltYWdpbmFyeS5hZGRJbWFnaW5hcnkoQVsxXSwgQlsxXSldO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBTdWJ0cmFjdGlvblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5Db21wbGV4LnN1YlJlYWwgPSAoeiwgcikgPT4ge1xuICByZXR1cm4gW3pbMF0gLSByLCB6WzFdXTtcbn07XG5cbkNvbXBsZXguc3ViUmVhbEludmVyc2UgPSAoeiwgcikgPT4ge1xuICByZXR1cm4gW3IgLSB6WzBdLCBJbWFnaW5hcnkubXVsUmVhbCh6WzFdLCAtMSldO1xufTtcblxuQ29tcGxleC5zdWJJbWFnaW5hcnkgPSAoeiwgaikgPT4ge1xuICByZXR1cm4gW3pbMF0sIEltYWdpbmFyeS5hZGRJbWFnaW5hcnkoelsxXSwgSW1hZ2luYXJ5Lm11bFJlYWwoaiwgLTEpKV07XG59O1xuXG5Db21wbGV4LnN1YkltYWdpbmFyeUludmVyc2UgPSAoeiwgaikgPT4ge1xuICByZXR1cm4gWy0xICogelswXSwgSW1hZ2luYXJ5LmFkZEltYWdpbmFyeShqLCBJbWFnaW5hcnkubXVsUmVhbCh6WzFdLCAtMSkpXTtcbn07XG5cbkNvbXBsZXguc3ViQ29tcGxleCA9IChBLCBCKSA9PiB7XG4gIHZhciBDID0gW0JbMF0gKiAtMSwgSW1hZ2luYXJ5Lm11bFJlYWwoQlsxXSwgLTEpXVxuICByZXR1cm4gQ29tcGxleC5hZGRDb21wbGV4KEEsIEMpO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBNdWx0aXBsaWNhdGlvblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5Db21wbGV4Lm11bFJlYWwgPSAoeiwgcikgPT4ge1xuICByZXR1cm4gW3pbMF0qciwgSW1hZ2luYXJ5Lm11bFJlYWwoelsxXSwgcildO1xufTtcblxuQ29tcGxleC5tdWxJbWFnaW5hcnkgPSAoeiwgaikgPT4ge1xuICByZXR1cm4gW0ltYWdpbmFyeS5tdWxJbWFnaW5hcnkoelsxXSwgaiksIHpbMF0qal07XG59O1xuXG5Db21wbGV4Lm11bENvbXBsZXggPSAoQSwgQikgPT4ge1xuICB2YXIgejEgPSBDb21wbGV4Lm11bFJlYWwoQiwgQVswXSk7XG4gIHZhciB6MiA9IENvbXBsZXgubXVsSW1hZ2luYXJ5KEIsIEFbMV0pO1xuXG4gIHJldHVybiBDb21wbGV4LmFkZENvbXBsZXgoejEsIHoyKTtcbn07XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gQ29uanVnYXRlc1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5Db21wbGV4LmdldENvbmp1Z2F0ZSA9ICh6KSA9PiB7XG4gIHJldHVybiBbelswXSwgSW1hZ2luYXJ5Lm11bFJlYWwoelsxXSwgLTEpXTtcbn07XG5cbkNvbXBsZXguZ2V0Q29uanVnYXRlTXVsdGlwbGUgPSAoeikgPT4ge1xuICByZXR1cm4gQ29tcGxleC5tdWxDb21wbGV4KHosIENvbXBsZXguZ2V0Q29uanVnYXRlKHopKTtcbn07XG5cbkNvbXBsZXguZ2V0Q29uanVnYXRlU2ltcGxpZmllZCA9ICh6KSA9PiB7XG4gIHZhciBaID0gQ29tcGxleC5nZXRDb25qdWdhdGVNdWx0aXBsZSh6KTtcbiAgcmV0dXJuIFpbMF07XG59O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIERpdmlzaW9uXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbkNvbXBsZXguZGl2UmVhbCA9ICh6LCByKSA9PiB7XG4gIHJldHVybiBbelswXSAvIHIsIEltYWdpbmFyeS5kaXZSZWFsKHpbMV0sIHIpXTtcbn07XG5cbkNvbXBsZXguZGl2UmVhbEludmVyc2UgPSAoeiwgcikgPT4ge1xuICB2YXIgUiA9IFtyLCAwXTtcblxuICByZXR1cm4gQ29tcGxleC5kaXZDb21wbGV4KFIsIHopO1xufTtcblxuQ29tcGxleC5kaXZJbWFnaW5hcnkgPSAoeiwgaikgPT4ge1xuICByZXR1cm4gQ29tcGxleC5kaXZDb21wbGV4KHosIFswLCBqXSk7XG59O1xuXG5Db21wbGV4LmRpdkltYWdpbmFyeUludmVyc2UgPSAoeiwgaikgPT4ge1xuICB2YXIgSSA9IFswLCBqXTtcblxuICByZXR1cm4gQ29tcGxleC5kaXZDb21wbGV4KEksIHopO1xufTtcblxuQ29tcGxleC5kaXZDb21wbGV4ID0gKEEsIEIpID0+IHtcbiAgdmFyIEMgPSBDb21wbGV4LmdldENvbmp1Z2F0ZShCKTtcblxuICB2YXIgWiA9IENvbXBsZXgubXVsQ29tcGxleChBLCBDKTtcbiAgdmFyIFJaID0gQ29tcGxleC5tdWxDb21wbGV4KEIsIEMpO1xuXG4gIHZhciByID0gUlpbMF07XG5cbiAgcmV0dXJuIFtaWzBdIC8gciwgSW1hZ2luYXJ5LmRpdlJlYWwoWlsxXSwgcildO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21wbGV4O1xuIiwidmFyIENvbXBsZXggPSB7XG4gIGFkZFJlYWw6ICh6LCByKSA9PiAwLjAsXG4gIGFkZEltYWdpbmFyeTogKHosIGopID0+IDAuMCxcbiAgYWRkQ29tcGxleDogKHosIHowKSA9PiAwLjAsXG4gIHN1YlJlYWw6ICh6LCByKSA9PiAwLjAsXG4gIHN1YkltYWdpbmFyeTogKHosIGopID0+IDAuMCxcbiAgc3ViQ29tcGxleDogKHosIHowKSA9PiAwLjAsXG4gIHN1YlJlYWxJbnZlcnNlOiAoeiwgcikgPT4gMC4wLFxuICBzdWJJbWFnaW5hcnlJbnZlcnNlOiAoeiwgaikgPT4gMC4wLFxuICBzdWJDb21wbGV4SW52ZXJzZTogKHosIHowKSA9PiAwLjAsXG4gIG11bFJlYWw6ICh6LCByKSA9PiAwLjAsXG4gIG11bEltYWdpbmFyeTogKHosIGopID0+IDAuMCxcbiAgbXVsQ29tcGxleDogKHosIHowKSA9PiAwLjAsXG4gIGRpdlJlYWw6ICh6LCByKSA9PiAwLjAsXG4gIGRpdkltYWdpbmFyeTogKHosIGopID0+IDAuMCxcbiAgZGl2Q29tcGxleDogKHosIHowKSA9PiAwLjAsXG4gIGRpdlJlYWxJbnZlcnNlOiAoeiwgcikgPT4gMC4wLFxuICBkaXZJbWFnaW5hcnlJbnZlcnNlOiAoeiwgaikgPT4gMC4wLFxuICBkaXZDb21wbGV4SW52ZXJzZTogKHosIHowKSA9PiAwLjAsXG5cbiAgZXE6ICh6LCB6MCkgPT4gMC4wLFxuICBuZXE6ICh6LCB6MCkgPT4gMC4wLFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21wbGV4O1xuIiwidmFyIEltYWdpbmFyeSA9IHJlcXVpcmUoJy4vaW1hZ2luYXJ5X2hlYWRlcicpO1xuXG5JbWFnaW5hcnkuYWRkSW1hZ2luYXJ5ID0gKGosIGowKSA9PiB7XG4gIHJldHVybiBqICsgajA7XG59O1xuXG5JbWFnaW5hcnkuYWRkUmVhbCA9IChqLCByKSA9PiB7XG4gIHJldHVybiBbciwgal07XG59O1xuXG5JbWFnaW5hcnkuc3ViSW1hZ2luYXJ5ID0gKGosIGowKSA9PiB7XG4gIHJldHVybiBqIC0gajA7XG59O1xuXG5JbWFnaW5hcnkuc3ViUmVhbCA9IChqLCByKSA9PiB7XG4gIHJldHVybiBbMCAtIHIsIGpdO1xufTtcblxuSW1hZ2luYXJ5LnN1YlJlYWxJbnZlcnNlID0gKGosIHIpID0+IHtcbiAgcmV0dXJuIFtyLCAwIC0gal07XG59O1xuXG5JbWFnaW5hcnkuc3ViUmVhbCA9IChqLCByKSA9PiB7XG4gIHJldHVybiBbMCAtIHIsIGpdO1xufTtcblxuSW1hZ2luYXJ5Lm11bEltYWdpbmFyeSA9IChqLCBqMCkgPT4ge1xuICByZXR1cm4gaiAqIGowICogLTE7XG59O1xuXG5JbWFnaW5hcnkubXVsUmVhbCA9IChqLCByKSA9PiB7XG4gIHJldHVybiBqICogcjtcbn07XG5cbkltYWdpbmFyeS5kaXZJbWFnaW5hcnkgPSAoaiwgajApID0+IHtcbiAgdmFyIGNvbmp1Z2F0ZSA9IDAgLSBqMDtcblxuICAvLyAoM2kgLyA0aSlcbiAgLy8gKDNpKi00aSAvIDRpICogLTRpKVxuICAvLyAoLTEyaV4yIC8gLTE2aV4yKVxuICAvLyAoMTIgLyAtMTYpXG4gIHZhciBudW1lcmF0b3IgPSBJbWFnaW5hcnkubXVsSW1hZ2luYXJ5KGosIGNvbmp1Z2F0ZSk7XG4gIHZhciBkZW5vbWluYXRvciA9IEltYWdpbmFyeS5tdWxJbWFnaW5hcnkoajAsIGNvbmp1Z2F0ZSk7XG5cbiAgLy8gbnVtZXJhdG9yIGlzIHJlYWxcbiAgLy8gZGVub21pbmF0b3IgaXMgbm93IHJlYWxcbiAgcmV0dXJuIG51bWVyYXRvciAvIGRlbm9taW5hdG9yO1xufTtcblxuSW1hZ2luYXJ5LmRpdlJlYWwgPSAoaiwgcikgPT4ge1xuICByZXR1cm4gaiAvIHI7XG59O1xuXG4vLyByZXR1cm5zIGltYWdpbmFyeVxuSW1hZ2luYXJ5LmRpdlJlYWxJbnZlcnNlID0gKGosIHIpID0+IHtcbiAgdmFyIGNvbmp1Z2F0ZSA9IDAgLSBqO1xuXG4gIHZhciBudW1lcmF0b3IgPSBJbWFnaW5hcnkubXVsUmVhbChjb25qdWdhdGUsIHIpO1xuICB2YXIgZGVub21pbmF0b3IgPSBJbWFnaW5hcnkubXVsSW1hZ2luYXJ5KGNvbmp1Z2F0ZSwgaik7XG5cbiAgLy8gbnVtZXJhdG9yIGlzIG5vdyBpbWFnaW5hcnlcbiAgLy8gZGVub21pbmF0b3IgaXMgbm93IHJlYWxcbiAgcmV0dXJuIG51bWVyYXRvciAvIGRlbm9taW5hdG9yO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWFnaW5hcnk7XG4iLCJ2YXIgSW1hZ2luYXJ5ID0ge1xuICBhZGRJbWFnaW5hcnk6IChqLCBqMCkgPT4gMC4wLFxuICBhZGRSZWFsOiAoaiwgcikgPT4gMC4wLFxuICBzdWJJbWFnaW5hcnk6IChqLCBqMCkgPT4gMC4wLFxuICBzdWJSZWFsOiAoaiwgcikgPT4gMC4wLFxuICBzdWJGcm9tUmVhbDogKGosIHIpID0+IDAuMCxcbiAgbXVsSW1hZ2luYXJ5OiAoaiwgajApID0+IDAuMCxcbiAgbXVsUmVhbDogKGosIHIpID0+IDAuMCxcbiAgZGl2SW1hZ2luYXJ5OiAoaiwgajApID0+IDAuMCxcbiAgZGl2UmVhbDogKGosIHIpID0+IDAuMCxcbiAgZGl2UmVhbEludmVyc2U6IChqLCByKSA9PiAwLjAsXG5cbiAgZXE6IChqLCBqMCkgPT4gMC4wLFxuICBuZXE6IChqLCBqMCkgPT4gMC4wLFxuICBndDogKGosIGowKSA9PiAwLjAsXG4gIGx0OiAoaiwgajApID0+IDAuMCxcbiAgZ3RlOiAoaiwgajApID0+IDAuMCxcbiAgbHRlOiAoaiwgajApID0+IDAuMCxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2luYXJ5O1xuIiwidmFyIFVpID0gcmVxdWlyZSgnLi91aScpO1xudmFyIE1hbmRsZSA9IHJlcXVpcmUoJy4vbWFuZGxlJyk7XG5cbmRpc2NsYWltZXIoKTtcblxudmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcbnZhciBtID0gTWFuZGxlLmluaXRfbWFuZGxlX2NvbmZpZyhjYW52YXMpO1xuXG5mdW5jdGlvbiBkaXNjbGFpbWVyKCkge1xuICB2YXIgJGQgPSAkKCcjZGlzY2xhaW1lcicpO1xuXG4gICRkLm9uKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbiAoZSkge1xuICB9KTtcblxuICAkKCcuanMtZGlzY2xhaW1lci1vaycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICBVaS5iaW5kX2V2ZW50cyhtKTtcbiAgICBVaS5vblJlbmRlcihtKTtcblxuICAgICRkLm1vZGFsKCdoaWRlJyk7XG4gIH0pO1xuXG4gICQoJy5qcy1kaXNjbGFpbWVyLWNhbmNlbCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICdodHRwOi8vd3d3LnJvY2tzb2xpZHdlYmRlc2lnbi5jb20vJztcbiAgfSk7XG5cbiAgJGQubW9kYWwoKTtcbn1cbiIsInZhciB0aW55Z3JhZGllbnQgPSByZXF1aXJlKCd0aW55Z3JhZGllbnQnKTtcbnZhciBDb21wbGV4ID0gcmVxdWlyZSgnLi9jb21wbGV4X2FycmF5Jyk7XG52YXIgUHJvZmlsZXIgPSByZXF1aXJlKCcuL3Byb2ZpbGVyJyk7XG5cbnZhciBNYW5kbGUgPSB7XG4gIHJlbmRlcl9jYW52YXM6IGZ1bmN0aW9uKG0sIGRhdGEpIHtcbiAgICBpZiAobS5pc19kaXJ0eSkge1xuICAgICAgTWFuZGxlLnN5bmNfbWFuZGxlX2NvbmZpZyhtKTtcbiAgICAgIG0uaXNfZGlydHkgPSBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvZmlsZXIudGFzayhcInJlbmRlclwiLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBNYW5kbGUucmVuZGVyKGRhdGEsIG0ubnVtX3BpeGVscywgbS5udW1faXRlciwgbS5jdHgpO1xuICAgIH0pO1xuICB9LFxuXG4gIGdldF9jb21wbGV4X3BsYW5lOiBmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIFByb2ZpbGVyLnRhc2soXCJjb21wbGV4X3BsYW5lXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIE1hbmRsZS5jb21wbGV4X3BsYW5lKG0ubnVtX3BpeGVscyk7XG4gICAgfSk7XG4gIH0sXG5cbiAgcHJvY2Vzc19zdWJzZXQ6IGZ1bmN0aW9uKG0pIHtcbiAgICB2YXIgdiA9IE1hbmRsZS5nZXRfZ2VuZXJhdGVkX3ZhbHVlcyhtKTtcbiAgICByZXR1cm4gTWFuZGxlLmdldF9jb2xvcml6ZWRfdmFsdWVzKG0sIHYpO1xuICB9LFxuXG4gIGdldF9jb2xvcml6ZWRfdmFsdWVzOiBmdW5jdGlvbihtLCB2KSB7XG4gICAgcmV0dXJuIFByb2ZpbGVyLnRhc2soXCJjb2xvcml6ZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBNYW5kbGUuY29sb3JpemUodiwgbS5udW1fcGl4ZWxzLCBtLm51bV9pdGVyLCBtLmdyYWRpZW50X2RlZiwgbS5ncmFkaWVudF9wcm9maWxlLCBtLmdyYWRpZW50X2NvdW50ZXJfY2xvY2t3aXNlKTtcbiAgICB9KTtcbiAgfSxcblxuICAvL2dldF9nZW5lcmF0ZWRfdmFsdWVzOiBmdW5jdGlvbihtKSB7XG4gIC8vICByZXR1cm4gUHJvZmlsZXIudGFzayhcImdlbmVyYXRlXCIsIGZ1bmN0aW9uKCkge1xuICAvLyAgICByZXR1cm4gTWFuZGxlLmdlbmVyYXRlKG0uY2VudGVyX3gsIG0uY2VudGVyX3ksIG0ucGl4ZWxfc2l6ZSwgbS5udW1fcGl4ZWxzLCBtLm51bV9pdGVyKTtcbiAgLy8gIH0pO1xuICAvL30sXG5cbiAgLy9nZW5lcmF0ZTogZnVuY3Rpb24oY2VudGVyX3gsIGNlbnRlcl95LCBwaXhlbF9zcGFjaW5nLCBudW1fcGl4ZWxzLCBudW1faXRlciwgbnVtX2pvYnMsIGpvYl9pZCkge1xuICAvL30sXG5cbiAgZ2V0X2dlbmVyYXRlZF92YWx1ZXM6IGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4gUHJvZmlsZXIudGFzayhcImdlbmVyYXRlXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIE1hbmRsZS5nZW5lcmF0ZShtLnlfbWluLCBtLnlfbWF4LCBtLm51bV9waXhlbHMsIG0ubnVtX2l0ZXIsIG0uZWRnZV9sZWZ0LCBtLmVkZ2VfcmlnaHQsIG0uZWRnZV90b3AsIG0uZWRnZV9ib3R0b20pO1xuICAgIH0pO1xuICB9LFxuXG4gIGdlbmVyYXRlOiBmdW5jdGlvbih5X2Nvb3JkX21pbiwgeV9jb29yZF9tYXgsIG51bV9waXhlbHMsIG51bV9pdGVyLCBlZGdlX2xlZnQsIGVkZ2VfcmlnaHQsIGVkZ2VfdG9wLCBlZGdlX2JvdHRvbSkge1xuICAgIHZhciBudW1fcm93cyA9IHlfY29vcmRfbWF4IC0geV9jb29yZF9taW47XG4gICAgdmFyIGxlbiA9IG51bV9yb3dzICogbnVtX3BpeGVscztcblxuICAgIHZhciBNID0gbmV3IEZsb2F0NjRBcnJheShsZW4pO1xuXG4gICAgdmFyIGRpc3QgPSBlZGdlX3RvcCAtIGVkZ2VfYm90dG9tO1xuICAgIC8vdmFyIHN0ZXAgPSAoNCkgLyBudW1fcGl4ZWxzO1xuICAgIHZhciBzdGVwID0gKGRpc3QpIC8gbnVtX3BpeGVscztcblxuICAgIHZhciBpID0gMDtcbiAgICBmb3IgKHZhciB5X2Nvb3JkID0geV9jb29yZF9tYXg7IHlfY29vcmQgPiB5X2Nvb3JkX21pbjsgeV9jb29yZCAtPSAxKSB7XG4gICAgICB2YXIgeV92YWwgPSBlZGdlX3RvcCAtICh5X2Nvb3JkICogc3RlcCk7XG4gICAgICBmb3IgKHZhciB4X2Nvb3JkID0gMDsgeF9jb29yZCA8IG51bV9waXhlbHM7IHhfY29vcmQgKz0gMSkge1xuICAgICAgICB2YXIgeF92YWwgPSBlZGdlX2xlZnQgKyAoeF9jb29yZCAqIHN0ZXApO1xuXG4gICAgICAgIHZhciBjID0gW3hfdmFsLCB5X3ZhbF07XG5cbiAgICAgICAgdmFyIG51bV9zdGVwcyA9IE1hbmRsZS5pdGVyYXRlKGMsIG51bV9pdGVyKTtcblxuICAgICAgICBNW2ldID0gbnVtX3N0ZXBzO1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIE07XG4gIH0sXG5cbiAgZ3JhZGllbnRfZmFjdG9yeTogZnVuY3Rpb24oZ3JhZGllbnRfZGVmLCBudW1faXRlciwgZ3JhZGllbnRfcHJvZmlsZSwgZ3JhZGllbnRfY291bnRlcl9jbG9ja3dpc2UpIHtcbiAgICB2YXIgZ3JhZGllbnQgPSB0aW55Z3JhZGllbnQuYXBwbHkodGlueWdyYWRpZW50LCBncmFkaWVudF9kZWYpO1xuICAgIHJldHVybiBncmFkaWVudFtncmFkaWVudF9wcm9maWxlXShudW1faXRlciArIDEsICFncmFkaWVudF9jb3VudGVyX2Nsb2Nrd2lzZSk7XG4gIH0sXG5cbiAgY29sb3JpemU6IGZ1bmN0aW9uKE0sIG51bV9waXhlbHMsIG51bV9pdGVyLCBncmFkaWVudF9kZWYsIGdyYWRpZW50X3Byb2ZpbGUsIGdyYWRpZW50X2NvdW50ZXJfY2xvY2t3aXNlKSB7XG4gICAgdmFyIE1NID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KE0ubGVuZ3RoICogNCk7XG4gICAgdmFyIGcgPSBNYW5kbGUuZ3JhZGllbnRfZmFjdG9yeShncmFkaWVudF9kZWYsIG51bV9pdGVyLCBncmFkaWVudF9wcm9maWxlLCBncmFkaWVudF9jb3VudGVyX2Nsb2Nrd2lzZSk7XG5cbiAgICB2YXIgdmFscyA9IHt9O1xuXG4gICAgdmFyIG9mZnNldCA9IG51bV9waXhlbHMgLyAyO1xuICAgIHZhciBoZWF0X3ZhbHVlID0gXCJcIjtcbiAgICB2YXIgdmFsLCB4LCB5O1xuXG4gICAgdmFyIHN0cmVuZ3RoID0gMTtcbiAgICB2YXIgbGV2ZWwgPSA1MCAqIHN0cmVuZ3RoO1xuICAgIHZhciBwZXJjZW50ID0gKDMwICsgbGV2ZWwpIC8gMTAwO1xuICAgIHZhciBoZXggPSAoMjU1ICogcGVyY2VudCkudG9GaXhlZCgwKTtcbiAgICB2YXIgcGl4ZWxfY29sb3I7XG5cbiAgICB2YXIgbGVuID0gTU0ubGVuZ3RoO1xuICAgIGZvciAoeCA9IDA7IHggPCBsZW47IHggKz0gNCkge1xuICAgICAgdmFsID0gTVt4IC8gNF07XG5cbiAgICAgIGlmICh2YWwgPD0gMCkge1xuICAgICAgICBNTVt4XSAgID0gMDtcbiAgICAgICAgTU1beCsxXSA9IDA7XG4gICAgICAgIE1NW3grMl0gPSAwO1xuICAgICAgICBNTVt4KzNdID0gMjU1O1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHBpeGVsX2NvbG9yID0gZ1t2YWxdO1xuXG4gICAgICAgIGlmIChwaXhlbF9jb2xvciAmJiB0eXBlb2YgcGl4ZWxfY29sb3IudG9IZXggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBzdHJlbmd0aCA9IHZhbCAvIG51bV9pdGVyO1xuICAgICAgICAgIGxldmVsID0gNTAgKiBzdHJlbmd0aDtcbiAgICAgICAgICBwZXJjZW50ID0gKDMwICsgbGV2ZWwpIC8gMTAwO1xuICAgICAgICAgIGhleCA9ICgyNTUgKiBwZXJjZW50KS50b0ZpeGVkKDApO1xuXG4gICAgICAgICAgTU1beF0gICA9IHBpeGVsX2NvbG9yLl9yO1xuICAgICAgICAgIE1NW3grMV0gPSBwaXhlbF9jb2xvci5fZztcbiAgICAgICAgICBNTVt4KzJdID0gcGl4ZWxfY29sb3IuX2I7XG4gICAgICAgICAgTU1beCszXSA9IDI1NTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBNTVt4XSAgID0gMjU1O1xuICAgICAgICAgIE1NW3grMV0gPSAyNTU7XG4gICAgICAgICAgTU1beCsyXSA9IDI1NTtcbiAgICAgICAgICBNTVt4KzNdID0gMjU1O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIE1NO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oTSwgbnVtX3BpeGVscywgbnVtX2l0ZXIsIGN0eCkge1xuICAgIHZhciBpbWcgPSBuZXcgSW1hZ2VEYXRhKE0sbnVtX3BpeGVscyxudW1fcGl4ZWxzKTtcbiAgICBjdHgucHV0SW1hZ2VEYXRhKGltZywgMCwgMCk7XG4gICAgLy9jdHgucHV0SW1hZ2VEYXRhKGltZywgMCwgMCwgMCwgMCwgbnVtX3BpeGVscywgbnVtX3BpeGVscyk7XG4gIH0sXG5cbiAgcmVuZGVyX21hbmRsZWJyb3RfYXNjaWk6IGZ1bmN0aW9uKE0sIG51bV9waXhlbHMpIHtcbiAgICByZXN1bHQgPSBcIlwiO1xuXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBudW1fcGl4ZWxzOyB5KyspIHtcbiAgICAgIHJlc3VsdCArPSBcIk06IFwiO1xuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCBudW1fcGl4ZWxzOyB4KyspIHtcbiAgICAgICAgaWYgKE1beSpudW1fcGl4ZWxzK3hdID09IDAuMCkge1xuICAgICAgICAgIHJlc3VsdCArPSBcIiBcIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICByZXN1bHQgKz0gTVt5Km51bV9waXhlbHMreF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlc3VsdCArPSAnXFxuJztcbiAgICB9XG4gICAgcmVzdWx0ICs9ICdcXG4nO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcblxuICBpdGVyYXRlOiBmdW5jdGlvbihjLCBudW1faXRlcikge1xuICAgIHZhciByZXN1bHQgPSBbMCwgMF07XG5cbiAgICB2YXIgc3RlcHNfb3V0ID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bV9pdGVyOyBpKyspIHtcbiAgICAgIHJlc3VsdCA9IE1hbmRsZS5mX29mX2MocmVzdWx0LCBjKTtcblxuICAgICAgdmFyIGlzX291dCA9IChcbiAgICAgICAgcmVzdWx0WzBdID4gMi4wIHx8XG4gICAgICAgIHJlc3VsdFsxXSA+IDIuMCB8fFxuICAgICAgICByZXN1bHRbMF0gPCAtMi4wIHx8XG4gICAgICAgIHJlc3VsdFsxXSA8IC0yLjBcbiAgICAgICk7XG5cbiAgICAgIGlmIChpc19vdXQpIHtcbiAgICAgICAgc3RlcHNfb3V0ID0gaSArIDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzdGVwc19vdXQ7XG4gIH0sXG5cbiAgLy9odHRwczovL3JhbmRvbWFzY2lpLndvcmRwcmVzcy5jb20vMjAxMS8wOC8xMy9mYXN0ZXItZnJhY3RhbHMtdGhyb3VnaC1hbGdlYnJhL1xuICAvLyB6LnIgPSAwO1xuICAvLyB6LmkgPSAwO1xuICAvLyB6cnNxciA9IHouciAqIHoucjtcbiAgLy8gemlzcXIgPSB6LmkgKiB6Lmk7XG4gIC8vIHdoaWxlICh6cnNxciArIHppc3FyIDwgNC4wKVxuICAvLyB7XG4gIC8vICAgICB6LmkgPSB6LnIgKiB6Lmk7XG4gIC8vICAgICB6LmkgKz0gei5pOyAvLyBNdWx0aXBseSBieSB0d29cbiAgLy8gICAgIHouaSArPSBjLmk7XG4gIC8vICAgICB6LnIgPSB6cnNxciDigJMgemlzcXIgKyBjLnI7XG4gIC8vICAgICB6cnNxciA9IHNxdWFyZSh6LnIpO1xuICAvLyAgICAgemlzcXIgPSBzcXVhcmUoei5pKTtcbiAgLy8gfVxuICAvL1xuICAvL2l0ZXJhdGU6IGZ1bmN0aW9uKGMsIG51bV9pdGVyKSB7XG4gIC8vICB6X3IgPSBjWzBdO1xuICAvLyAgel9pID0gY1sxXTtcblxuICAvLyAgenJzcXIgPSB6X3IgKiB6X3I7XG4gIC8vICB6aXNxciA9IHpfaSAqIHpfaTtcblxuICAvLyAgd2hpbGUgKHpyc3FyICsgemlzcXIgPCAyKVxuICAvLyAge1xuICAvLyAgICAgIHpfaSA9IHpfciAqIHpfaTtcbiAgLy8gICAgICB6X2kgKz0gel9pOyAvLyBNdWx0aXBseSBieSB0d29cbiAgLy8gICAgICB6X2kgKz0gY19pO1xuICAvLyAgICAgIHpfciA9IHpyc3FyIC0gemlzcXIgKyBjX3I7XG4gIC8vICAgICAgenJzcXIgPSBzcXVhcmUoel9yKTtcbiAgLy8gICAgICB6aXNxciA9IHNxdWFyZSh6X2kpO1xuICAvLyAgfVxuICAvL30sXG5cbiAgZl9vZl9jOiBmdW5jdGlvbih6LCBjKSB7XG4gICAgcmV0dXJuIENvbXBsZXguYWRkQ29tcGxleChDb21wbGV4Lm11bENvbXBsZXgoeiwgeiksIGMpO1xuICB9LFxuXG4gIGluaXRfbWFuZGxlX2NvbmZpZzogZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgdmFyIG51bV90aHJlYWRzID0gMTtcbiAgICB2YXIgbnVtX2l0ZXIgPSA1MDtcbiAgICB2YXIgbnVtX3BpeGVscyA9IDEwMDtcblxuICAgIC8vdmFyIGdyYWRpZW50X2RlZiA9IFtcbiAgICAvLyAge2NvbG9yOiAnYmx1ZScsIHBvczogMH0sXG4gICAgLy8gIHtjb2xvcjogJ3llbGxvdycsIHBvczogMX0sXG4gICAgLy9dO1xuXG4gICAgdmFyIGdyYWRpZW50X2RlZiA9IFtcbiAgICAgICcjZmYwMDAwJyxcbiAgICAgICcjZmY5ZjAwJyxcbiAgICAgICcjZmZmZjAwJyxcbiAgICAgICcjOWZmZjAwJyxcbiAgICAgICcjMDBmZjAwJyxcbiAgICAgICcjMDBmZjlmJyxcbiAgICAgICcjMDBmZmZmJyxcbiAgICAgICcjMDA5ZmZmJyxcbiAgICAgICcjMDAwMGZmJyxcbiAgICAgICcjOWYwMGZmJyxcbiAgICAgICcjZmYwMGZmJyxcbiAgICAgICcjZmYwMDlmJyxcbiAgICBdO1xuXG4gICAgdmFyIGdyYWRpZW50X3Byb2ZpbGUgPSAnaHN2JztcbiAgICB2YXIgZ3JhZGllbnRfY291bnRlcl9jbG9ja3dpc2UgPSBmYWxzZTtcblxuICAgIHZhciBtID0ge1xuICAgICAgY2FudmFzOiBjYW52YXMsXG4gICAgICBjdHg6IGN0eCxcbiAgICAgIG51bV9pdGVyOiBudW1faXRlcixcbiAgICAgIG51bV90aHJlYWRzOiBudW1fdGhyZWFkcyxcbiAgICAgIG51bV9waXhlbHM6IG51bV9waXhlbHMsXG4gICAgICBncmFkaWVudF9kZWY6IGdyYWRpZW50X2RlZixcbiAgICAgIGdyYWRpZW50X2NvdW50ZXJfY2xvY2t3aXNlOiBncmFkaWVudF9jb3VudGVyX2Nsb2Nrd2lzZSxcbiAgICAgIGdyYWRpZW50X3Byb2ZpbGU6IGdyYWRpZW50X3Byb2ZpbGUsXG4gICAgICB6b29tX2xldmVsOiAxLFxuICAgICAgem9vbV9kaXNwbGF5OiAxLFxuICAgICAgcmFkaXVzOiAyLFxuICAgICAgZWRnZV9sZWZ0OiAtMixcbiAgICAgIGVkZ2VfcmlnaHQ6IDIsXG4gICAgICBlZGdlX3RvcDogMixcbiAgICAgIGVkZ2VfYm90dG9tOiAtMixcbiAgICB9O1xuXG4gICAgTWFuZGxlLnN5bmNfbWFuZGxlX2NvbmZpZyhtKTtcblxuICAgIHJldHVybiBtO1xuICB9LFxuXG4gIHN5bmNfbWFuZGxlX2NvbmZpZzogZnVuY3Rpb24obSkge1xuICAgIG0uY2FudmFzLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBtLm51bV9waXhlbHMpO1xuICAgIG0uY2FudmFzLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgbS5udW1fcGl4ZWxzKTtcbiAgfSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFuZGxlO1xuIiwiZnVuY3Rpb24gcmVwb3J0X3Byb2ZpbGluZyhzdGFydCwgZW5kLCBtc2cpIHtcbiAgdmFyIHRvdGFsID0gKChlbmQgLSBzdGFydCkgLyAxMDAwKS50b0ZpeGVkKDMpO1xuXG4gIGNvbnNvbGUubG9nKFwiICBFTkQgW1wiICsgdG90YWwgKyBcInNdIFwiICsgbXNnKTtcbn1cblxuZnVuY3Rpb24gbWVhc3VyZV90aW1lX2Zvcl90YXNrKGRlc2MsIGYpIHtcbiAgY29uc29sZS5sb2coXCJCRUdJTiBbMC4wMDBzXSBcIiArIGRlc2MpO1xuXG4gIHZhciB0MSA9IE51bWJlcihuZXcgRGF0ZSgpKTtcbiAgdmFyIHJlc3VsdCA9IGYoKTtcbiAgdmFyIHQyID0gTnVtYmVyKG5ldyBEYXRlKCkpO1xuICByZXBvcnRfcHJvZmlsaW5nKHQxLCB0MiwgZGVzYyk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB0YXNrOiBtZWFzdXJlX3RpbWVfZm9yX3Rhc2ssXG59O1xuIiwidmFyIGRlZmF1bHRfc3Bpbm5lcl9vcHRzID0ge1xuICAgIGxpbmVzOiAxMyAvLyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRvIGRyYXdcbiAgICAgICwgbGVuZ3RoOiA1IC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXG4gICAgICAsIHdpZHRoOiAyIC8vIFRoZSBsaW5lIHRoaWNrbmVzc1xuICAgICAgLCByYWRpdXM6IDUgLy8gVGhlIHJhZGl1cyBvZiB0aGUgaW5uZXIgY2lyY2xlXG4gICAgICAsIHNjYWxlOiAxIC8vIFNjYWxlcyBvdmVyYWxsIHNpemUgb2YgdGhlIHNwaW5uZXJcbiAgICAgICwgY29ybmVyczogMSAvLyBDb3JuZXIgcm91bmRuZXNzICgwLi4xKVxuICAgICAgLCBjb2xvcjogJyM3Nzc3NzcnIC8vICNyZ2Igb3IgI3JyZ2diYiBvciBhcnJheSBvZiBjb2xvcnNcbiAgICAgICwgb3BhY2l0eTogMC4yNSAvLyBPcGFjaXR5IG9mIHRoZSBsaW5lc1xuICAgICAgLCByb3RhdGU6IDAgLy8gVGhlIHJvdGF0aW9uIG9mZnNldFxuICAgICAgLCBkaXJlY3Rpb246IDEgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxuICAgICAgLCBzcGVlZDogMSAvLyBSb3VuZHMgcGVyIHNlY29uZFxuICAgICAgLCB0cmFpbDogNjAgLy8gQWZ0ZXJnbG93IHBlcmNlbnRhZ2VcbiAgICAgICwgZnBzOiAyMCAvLyBGcmFtZXMgcGVyIHNlY29uZCB3aGVuIHVzaW5nIHNldFRpbWVvdXQoKSBhcyBhIGZhbGxiYWNrIGZvciBDU1NcbiAgICAgICwgekluZGV4OiAzZTkgLy8gVGhlIHotaW5kZXggKGRlZmF1bHRzIHRvIDIwMDAwMDAwMDApXG4gICAgICAsIGNsYXNzTmFtZTogJ3NwaW5uZXInIC8vIFRoZSBDU1MgY2xhc3MgdG8gYXNzaWduIHRvIHRoZSBzcGlubmVyXG4gICAgICAsIHRvcDogJzUwJScgLy8gVG9wIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxuICAgICAgLCBsZWZ0OiAnNTAlJyAvLyBMZWZ0IHBvc2l0aW9uIHJlbGF0aXZlIHRvIHBhcmVudFxuICAgICAgLCBzaGFkb3c6IGZhbHNlIC8vIFdoZXRoZXIgdG8gcmVuZGVyIGEgc2hhZG93XG4gICAgICAsIGh3YWNjZWw6IGZhbHNlIC8vIFdoZXRoZXIgdG8gdXNlIGhhcmR3YXJlIGFjY2VsZXJhdGlvblxuICAgICAgLCBwb3NpdGlvbjogJ3JlbGF0aXZlJyAvLyBFbGVtZW50IHBvc2l0aW9uaW5nXG59O1xuXG5mdW5jdGlvbiBTKGVsLCBvcHRzKSB7XG4gIHRoaXMuZWwgPSBlbCB8fCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3Bpbm5lcicpO1xuICB0aGlzLm9wdHMgPSBvcHRzIHx8IGRlZmF1bHRfc3Bpbm5lcl9vcHRzO1xuICB0aGlzLnNwaW5uZXIgPSBuZXcgU3Bpbm5lcih0aGlzLm9wdHMpO1xufVxuXG5TLnByb3RvdHlwZSA9IHtcbiAgaGlkZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zcGlubmVyLnN0b3AoKTtcbiAgICAvLyQoZWwpLmFkZENsYXNzKCdoaWRlJyk7XG4gIH0sXG5cbiAgc2hvdzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zcGlubmVyLnNwaW4oKTtcbiAgICB0aGlzLmVsLmFwcGVuZENoaWxkKHRoaXMuc3Bpbm5lci5lbCk7XG4gICAgLy8kKGVsKS5yZW1vdmVDbGFzcygnaGlkZScpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUztcbiIsInZhciBUaHJvYmJlciA9IHJlcXVpcmUoJy4vc3Bpbm5lcicpO1xudmFyIEFwcCA9IHJlcXVpcmUoJy4vYXBwJyk7XG52YXIgTWFuZGxlID0gcmVxdWlyZSgnLi9tYW5kbGUnKTtcblxuZnVuY3Rpb24gb25SZW5kZXIobSkge1xuICBpZiAobS5pc19yZW5kZXJpbmcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgdGhyb2JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZW5kZXJfc3Bpbm5lcicpO1xuICB2YXIgdGhyb2IgPSBuZXcgVGhyb2JiZXIodGhyb2JFbCk7XG4gIHRocm9iLnNob3coKTtcblxuICBtLmlzX3JlbmRlcmluZyA9IHRydWU7XG4gIEFwcC5nZW5lcmF0ZV90aHJlYWRlZChtKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBNYW5kbGUucmVuZGVyX2NhbnZhcyhtLCBkYXRhKTtcbiAgICBtLmlzX3JlbmRlcmluZyA9IGZhbHNlO1xuICAgIHRocm9iLmhpZGUoKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG9uQ2hhbmdlUHJvZmlsZShtLCBlKSB7XG4gIHZhciB2YWwgPSAkKGUuY3VycmVudFRhcmdldCkudmFsKCk7XG5cbiAgbS5ncmFkaWVudF9wcm9maWxlID0gdmFsO1xuXG4gIG0uaXNfZGlydHkgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBvbkNoYW5nZUNsb2Nrd2lzZShtLCBlKSB7XG4gIHZhciB2YWwgPSAkKGUuY3VycmVudFRhcmdldCkudmFsKCk7XG5cbiAgaWYgKHZhbCA9PT0gJ2NvdW50ZXJfY2xvY2t3aXNlJykge1xuICAgIG0uZ3JhZGllbnRfY291bnRlcl9jbG9ja3dpc2UgPSB0cnVlO1xuICB9XG4gIGVsc2Uge1xuICAgIG0uZ3JhZGllbnRfY291bnRlcl9jbG9ja3dpc2UgPSBmYWxzZTtcbiAgfVxuXG4gIG0uaXNfZGlydHkgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBvbkNoYW5nZVBpeGVscyhtLCBlKSB7XG4gIHZhciB2YWwgPSAkKGUuY3VycmVudFRhcmdldCkudmFsKCk7XG5cbiAgaWYgKHZhbC5tYXRjaCgvXlswLTldKyQvKSAmJiAhaXNOYU4odmFsKSkge1xuICAgIG0ubnVtX3BpeGVscyA9IE51bWJlcih2YWwpO1xuXG4gICAgbS5pc19kaXJ0eSA9IHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gb25DaGFuZ2VNb3ZlKG0sIGUpIHtcbiAgaWYgKG0uaXNfcmVuZGVyaW5nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIGRpcmVjdGlvbiA9ICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCdtb3ZlJyk7XG5cbiAgdmFyIGRpc3QgPSAobS5lZGdlX3RvcCAtIG0uZWRnZV9ib3R0b20pICogMC4xO1xuICBpZiAoZGlyZWN0aW9uID09PSAnbicpIHtcbiAgICBtLmVkZ2VfdG9wIC09IGRpc3Q7XG4gICAgbS5lZGdlX2JvdHRvbSAtPSBkaXN0O1xuICB9XG4gIGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ3MnKSB7XG4gICAgbS5lZGdlX3RvcCArPSBkaXN0O1xuICAgIG0uZWRnZV9ib3R0b20gKz0gZGlzdDtcbiAgfVxuICBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICdlJykge1xuICAgIG0uZWRnZV9sZWZ0ICs9IGRpc3Q7XG4gICAgbS5lZGdlX3JpZ2h0ICs9IGRpc3Q7XG4gIH1cbiAgZWxzZSBpZiAoZGlyZWN0aW9uID09PSAndycpIHtcbiAgICBtLmVkZ2VfbGVmdCAtPSBkaXN0O1xuICAgIG0uZWRnZV9yaWdodCAtPSBkaXN0O1xuICB9XG5cbiAgb25SZW5kZXIobSk7XG59XG5cbmZ1bmN0aW9uIG9uQ2hhbmdlWm9vbShtLCBlKSB7XG4gIHZhciBkaXJlY3Rpb24gPSAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgnem9vbScpO1xuXG4gIGlmIChtLmlzX3JlbmRlcmluZykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciB6b29tRGlzdCA9IDAuMTtcbiAgdmFyIGRpc3QgPSAobS5lZGdlX3RvcCAtIG0uZWRnZV9ib3R0b20pICogem9vbURpc3Q7XG5cbiAgaWYgKGRpcmVjdGlvbiA9PT0gJ2luJykge1xuICAgIGlmIChtLnpvb21fZGlzcGxheSArIHpvb21EaXN0ID4gMTUuMDUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBtLnpvb21fbGV2ZWwgLT0gem9vbURpc3Q7XG4gICAgbS56b29tX2Rpc3BsYXkgKz0gem9vbURpc3Q7XG5cbiAgICBtLmVkZ2VfdG9wIC09IGRpc3Q7XG4gICAgbS5lZGdlX2JvdHRvbSArPSBkaXN0O1xuICAgIG0uZWRnZV9sZWZ0ICs9IGRpc3Q7XG4gICAgbS5lZGdlX3JpZ2h0IC09IGRpc3Q7XG4gIH1cbiAgZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnb3V0Jykge1xuICAgIGlmIChtLnpvb21fZGlzcGxheSAtIHpvb21EaXN0IDwgMC41KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbS56b29tX2xldmVsICs9IHpvb21EaXN0O1xuICAgIG0uem9vbV9kaXNwbGF5IC09IHpvb21EaXN0O1xuXG4gICAgbS5lZGdlX3RvcCArPSBkaXN0O1xuICAgIG0uZWRnZV9ib3R0b20gLT0gZGlzdDtcbiAgICBtLmVkZ2VfbGVmdCAtPSBkaXN0O1xuICAgIG0uZWRnZV9yaWdodCArPSBkaXN0O1xuICB9XG5cbiAgdmFyIHpvb21QZXJjZW50ID0gKG0uem9vbV9kaXNwbGF5ICogMTAwKTtcbiAgdmFyIGRpc3BsYXlMZXZlbCA9IHpvb21QZXJjZW50LnRvRml4ZWQoMCkgKyAnJSc7XG5cbiAgJCgnLmpzLXpvb20tZGlzcGxheScpLnZhbChkaXNwbGF5TGV2ZWwpO1xuXG4gIG9uUmVuZGVyKG0pO1xufVxuXG5mdW5jdGlvbiBvbkNoYW5nZUl0ZXJhdGlvbnMobSwgZSkge1xuICB2YXIgdmFsID0gJChlLmN1cnJlbnRUYXJnZXQpLnZhbCgpO1xuXG4gIHZhciBzYW5lVmFsID0gdmFsLnJlcGxhY2UoL1teMC05XS8sICcnKS5zbGljZSgwLDMpO1xuXG4gIGlmICghaXNOYU4oc2FuZVZhbCkpIHtcbiAgICB2YXIgcmVhbFZhbCA9IE51bWJlcihzYW5lVmFsKTtcbiAgICBpZiAocmVhbFZhbCA8IDEwKSB7XG4gICAgICByZWFsVmFsID0gMTA7XG4gICAgfVxuXG4gICAgbS5udW1faXRlciA9IHJlYWxWYWw7XG4gIH1cbiAgZWxzZSB7XG4gICAgbS5udW1faXRlciA9IDUwO1xuICB9XG5cbiAgJCgnLmpzLWlucHV0LWl0ZXJhdGlvbnMnKS52YWwobS5udW1faXRlcik7XG5cbiAgbS5pc19kaXJ0eSA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIG9uQ2hhbmdlTnVtVGhyZWFkcyhtLCBlKSB7XG4gIHZhciB2YWwgPSAkKGUuY3VycmVudFRhcmdldCkudmFsKCk7XG5cbiAgaWYgKHZhbC5tYXRjaCgvXlswLTldKyQvKSAmJiAhaXNOYU4odmFsKSkge1xuICAgIG0ubnVtX3RocmVhZHMgPSBOdW1iZXIodmFsKTtcbiAgICBtLmlzX2RpcnR5ID0gdHJ1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBiaW5kX2V2ZW50cyhtKSB7XG4gICQoJ2Zvcm0nKS5vbignc3VibWl0JywgZnVuY3Rpb24oZSkge1xuICAgIGNvbnNvbGUubG9nKFwiYWJvcnRcIik7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG5cbiAgJCgnLmpzLXJlbmRlci1idG4nKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgb25SZW5kZXIobSk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gICQoJy5qcy1pbnB1dC1waXhlbHMnKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIG9uQ2hhbmdlUGl4ZWxzKG0sIGUpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICAkKCcuanMtaW5wdXQtaXRlcmF0aW9ucycpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgb25DaGFuZ2VJdGVyYXRpb25zKG0sIGUpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICAkKCcuanMtaW5wdXQtbnVtLXRocmVhZHMnKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIG9uQ2hhbmdlTnVtVGhyZWFkcyhtLCBlKTtcblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG5cbiAgJCgnLmpzLWlucHV0LW1vdmUnKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgb25DaGFuZ2VNb3ZlKG0sIGUpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcblxuICAkKCcuanMtaW5wdXQtem9vbScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBvbkNoYW5nZVpvb20obSwgZSk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0pO1xuXG4gICQoJy5qcy1pbnB1dC1jbG9ja3dpc2UnKS5vbignY2hhbmdlJywgZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIG9uQ2hhbmdlQ2xvY2t3aXNlKG0sIGUpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGJpbmRfZXZlbnRzOiBiaW5kX2V2ZW50cyxcbiAgb25SZW5kZXI6IG9uUmVuZGVyLFxufTtcbiJdfQ==
