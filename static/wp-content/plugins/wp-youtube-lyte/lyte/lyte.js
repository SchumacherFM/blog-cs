(function (ly) {
    var d = document;

    var sch = "http";
    if (bU.indexOf('https') != -1) {
        sch += "s"
    }

    ly.te = function () {
        if (!rn) {
            var rn = 1;
            var mOs = navigator.userAgent.match(/(iphone|ipad|ipod|android)/i);
            lts = ly.getElementsByClassName("lyMe", "div");

            for (var i = 0, lln = lts.length; i < lln; i += 1) {
                p = lts[i];
                vid = p.id.substring(4);
                if (mOs === null) {
                    cN = p.className.replace(/lyMe/, "lyte") + " lP";
                    p.className = cN;
                    sprite = (bU + "lytesprite.png");
                    ly.addCss(".lyte .ctrl, .lyte .Rctrl, .lyte .Lctrl, .lyte .play { background-image: url(" + sprite + "); }");
                    if (cN.indexOf('audio') === -1) {
                        bgId = "lyte_" + vid;
                        thumb = d.getElementById(bgId).getAttribute("data-src");
                        if (thumb !== "") {
                            bgCss = "#" + bgId + " { background-image: url(" + thumb + "); }";
                            ly.addCss(bgCss);
                        } else {
                            scr = d.createElement('script');
                            scr.src = sch + "://gdata.youtube.com/feeds/api/playlists/" + vid + "?v=2&alt=json-in-script&callback=ly.parsePL&fields=id,entry";
                            scr.type = "text/javascript";
                            d.getElementsByTagName('head')[0].appendChild(scr);
                        }
                    }
                    p.onclick = ly.play;
                } else {
                    ly.play(p.id);
                }
            }
        }
        var rn = "";
    }

    ly.parsePL = function (r) {
        thumb = r.feed.entry[0].media$group.media$thumbnail[1].url;
        if ((sch == "https") && (thumb.indexOf('https' == -1))) {
            thumb = thumb.replace("http://", "https://");
        }
        t_id = r.feed.id.$t.match(/:playlist:(PL[a-zA-Z0-9_]+)/);
        id = "lyte_" + t_id[1];
        bgCss = "#" + id + " { background-image: url(" + thumb + "); }";
        ly.addCss(bgCss);
    }

    ly.getQ = function (nD) {
        qsa = "";
        if (rqs = nD.className.match(/qsa_(.*)\s/, "$1")) qsa = rqs[1].replace(/\\([\&\=\?])/g, "$1");
        return qsa;
    }

    ly.play = function (id) {
        if (typeof id === 'string') {
            tH = d.getElementById(id);
            aP = 0;
        } else {
            tH = this;
            tH.onclick = "";
            aP = 1;
        }

        vid = tH.id.substring(4);

        hidef = 0;
        if (tH.className.indexOf("hidef") !== -1) {
            hidef = "1&amp;vq=hd720"
        }

        if (tH.className.indexOf("playlist") === -1) {
            eU = sch + "://www.youtube.com/embed/" + vid + "?"
        } else {
            eU = sch + "://www.youtube.com/embed/videoseries?list=" + vid + "&"
        }

        qsa = ly.getQ(tH);

        if ((tH.className.indexOf("audio") !== -1) && (aP == 1)) {
            qsa += "&amp;autohide=0";
            aHgh = "438";
            aSt = "position:relative;top:-400px;"
        } else if ((tH.className.indexOf("audio") !== -1) && (aP == 0)) {
            tH.parentNode.style.height = "";
            tH.style.height = "";
            aHgh = tH.clientHeight;
            aSt = "height:" + aHgh + "px !important;";
        } else {
            aHgh = tH.clientHeight;
            aSt = "";
        }

        tH.innerHTML = "<iframe id=\"iF_" + vid + "\" width=\"" + tH.clientWidth * 2 + "\" height=\"" + aHgh + "\" src=\"" + eU + "autoplay=" + aP + "&amp;controls=1&amp;wmode=opaque&amp;rel=0&amp;egm=0&amp;iv_load_policy=3&amp;hd=" + hidef + qsa + "\" frameborder=\"0\" style=\"" + aSt + "\" allowfullscreen></iframe>"

        if (typeof tH.firstChild.getAttribute('kabl') == "string") tH.innerHTML = "Please check Karma Blocker's config.";

        if (aP == 0) {
            window.addEventListener("orientationchange", function () {
                d.getElementById(id).width = d.getElementById(id).parentNode.clientWidth;
            }, false);
        }
    }

    ly.getElementsByClassName = function (className, tag, elm) {
        if (d.getElementsByClassName) {
            getElementsByClassName = function (className, tag, elm) {
                elm = elm || d;
                var elements = elm.getElementsByClassName(className),
                    nodeName = (tag) ? new RegExp("\\b" + tag + "\\b", "i") : null,
                    returnElements = [],
                    current;
                for (var i = 0, il = elements.length; i < il; i += 1) {
                    current = elements[i];
                    if (!nodeName || nodeName.test(current.nodeName)) {
                        returnElements.push(current)
                    }
                }
                return returnElements
            }
        } else if (d.evaluate) {
            getElementsByClassName = function (className, tag, elm) {
                tag = tag || "*";
                elm = elm || d;
                var classes = className.split(" "),
                    classesToCheck = "",
                    xhtmlNamespace = "http://www.w3.org/1999/xhtml",
                    namespaceResolver = (d.documentElement.namespaceURI === xhtmlNamespace) ? xhtmlNamespace : null,
                    returnElements = [],
                    elements, node;
                for (var j = 0, jl = classes.length; j < jl; j += 1) {
                    classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]"
                }
                try {
                    elements = d.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null)
                } catch (e) {
                    elements = d.evaluate(".//" + tag + classesToCheck, elm, null, 0, null)
                }
                while ((node = elements.iterateNext())) {
                    returnElements.push(node)
                }
                return returnElements
            }
        } else {
            getElementsByClassName = function (className, tag, elm) {
                tag = tag || "*";
                elm = elm || d;
                var classes = className.split(" "),
                    classesToCheck = [],
                    elements = (tag === "*" && elm.all) ? elm.all : elm.getElementsByTagName(tag),
                    current, returnElements = [],
                    match;
                for (var k = 0, kl = classes.length; k < kl; k += 1) {
                    classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"))
                }
                for (var l = 0, ll = elements.length; l < ll; l += 1) {
                    current = elements[l];
                    match = false;
                    for (var m = 0, ml = classesToCheck.length; m < ml; m += 1) {
                        match = classesToCheck[m].test(current.className);
                        if (!match) {
                            break
                        }
                    }
                    if (match) {
                        returnElements.push(current)
                    }
                }
                return returnElements
            }
        }
        return getElementsByClassName(className, tag, elm)
    };

    ly.addCss = function (cssCode) {
        var stEl = d.createElement("style");
        stEl.type = "text/css";
        if (stEl.styleSheet) {
            stEl.styleSheet.cssText = cssCode;
        } else {
            stEl.appendChild(document.createTextNode(cssCode));
        }
        d.getElementsByTagName("head")[0].appendChild(stEl);
    }
}
    (window.ly = window.ly || {}));

(function () {
    var w = window;
    var d = document;

    if (w.addEventListener) {
        w.addEventListener('load', ly.te, false);
        d.addEventListener('DomContentLoaded', function () {
            setTimeout("ly.te()", 750)
        }, false);
    } else {
        w.onload = ly.te;
        setTimeout("ly.te()", 1000);
    }
}())
