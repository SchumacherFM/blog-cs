;(function (w) {

  Colors = {};
  Colors.names = {
    c1 : "#DC143C",
    c2 : "#EE82EE",
    c3 : "#4169E1",
    c4 : "#3CB371",
    c5 : "#CDCD00",
    c6 : "#8B8989",
    c7 : "#8E8E38"
  };
  Colors.called = {};
  Colors.hex2rgba = function (x, a) {
    var r = x.replace('#', '').match(/../g), g = [], i;
    for (i in r) {
      g.push(parseInt(r[i], 16));
    }
    g.push(a);
    return 'rgba(' + g.join() + ')';
  };

  Colors.random = function () {
    var keys = Object.keys(this.names),
      max = keys.length,
      called = Object.keys(this.called),
      color = keys[Math.floor(Math.random() * (max - 0)) + 0];

    if (Colors.called[color]) {
      if (max === called.length) {
        Colors.called = {};
      }
      return Colors.random();
    }
    Colors.called[color] = true;
    return this.names[color];
  };

  function getSlocLanguages(slocData) {
    var langs = [];
    var dupl = {};
    for (var version in slocData) {
      var set = slocData[version];
      for (var l in set) {
        if (!dupl[l] && set[l].FileCount > 15) {
          langs.push(l);
          dupl[l] = 1;
        }
      }
    }
    return langs;
  }

  function getSlocChartData(slocData, lang) {
    var chartData = {
      'labels'   : [],
      'datasets' : []
    };

    var protoRow = {
      'label' : "",
      'data'  : []
    };

    var statsSet = {};
    var rows = {};

    for (var version in slocData) {
      chartData.labels.push(version);
      var versionSLOC = slocData[version];
      if (!versionSLOC[lang]) {
        return chartData;
      }
      var langStats = versionSLOC[lang];

      for (var key in langStats) {
        if (!statsSet[key]) {
          rows[key] = JSON.parse(JSON.stringify(protoRow)); // clone object :-\
          rows[key].label = key;
          var col = Colors.random();
          rows[key].fillColor = Colors.hex2rgba(col, 0.5),
            rows[key].strokeColor = Colors.hex2rgba(col, 0.8),
            rows[key].highlightFill = Colors.hex2rgba(col, 0.75),
            rows[key].highlightStroke = Colors.hex2rgba(col, 1),

            statsSet[key] = 1;
        }
        rows[key].data.push(slocData[version][lang][key]);
      }
    }

    for (var r in rows) {
      chartData.datasets.push(rows[r]);
    }

    return chartData;
  }

  function generateSlocCharts(slocData) {

    var languages = getSlocLanguages(slocData);
    console.log('languages', languages)
    for (var i = 0; i < languages.length; i++) {
      var lang = languages[i];
      var canID = 'm2sloc' + lang;

      $('#slocCharts').append('<h2>Lines of Code for: ' + lang + '</h2>');

      var $can = $('<canvas/>', {
        'id'    : canID,
        'class' : 'sloc'
      });
      $can.attr({'width' : 700, 'height' : 525});
      $('#slocCharts').append($can);

      var ctx = $can.get(0).getContext("2d");
      var chartData = getSlocChartData(slocData, lang);
      new Chart(ctx).Bar(chartData, {
        scaleBeginAtZero     : false,
        responsive           : true,
        barShowStroke        : false,
        multiTooltipTemplate : "<%= datasetLabel %> - <%= value %>",
      });

    }
  }

  var $ = w.jQuery,
    done = false,
    ready = function () {
      $('form.searchform').on('submit', function (event) {
        if (false === done) {
          event.preventDefault();
          var target = event.currentTarget || event.target;
          var $form = w.jQuery(target);
          var orgVal = $form.find('.search').val();
          $form.find('.search').val('site:cyrillschumacher.com/ ' + orgVal);
          done = true;
          $form.submit();
        }
      });
      $('.hubinfo').each(function (i, e) {
        var $elem = $(e);
        $elem.hubInfo({
          user : $elem.data('u') || 'SchumacherFM',
          repo : $elem.data('r') || ''
        });
      });
      $('.hentry').matchHeight();
      $('.related.post-hover').matchHeight();

      if (window.slocData) {
        generateSlocCharts(window.slocData);
      }
    },
    hasSetBg = false,
    scroller = function (event) {
      var target = event.srcElement || event.target;
      if (target.body.scrollTop > 10 && false === hasSetBg) {
        $('.nav-container').css({
          background : '#26272b'
        });
        $('.nav-cs-icon').show();
        hasSetBg = true;
      }
      if (0 === target.body.scrollTop && true === hasSetBg) {
        $('.nav-container').css({
          background : 'none'
        });
        $('.nav-cs-icon').hide();
        hasSetBg = false;
      }
    };

  $('body').on('submit', '#commentform', function (e) {
    var $contactForm = $('#commentform');
    e.preventDefault();
    $.ajax({
        type     : 'POST',
        url      : $contactForm.attr('action'),
        data     : $contactForm.serialize(),
        dataType : 'json',
        encode   : true
      })
      .done(function (data) {
        console.log('data', data);
        if (!data.error) {
          $('#reply-title').html('Thank you for contacting me! You may get an answer.');
          $contactForm.hide();
          return;
        }
        alert("Ein Fehler ist aufgetreten: " + data.error);
      })
      .fail(function (data) {
        console.log('data', data);
        alert("Ein Fehler ist aufgetreten.");
      });

  });

  if (window.addEventListener) {
    window.addEventListener('load', ready, false);
    window.addEventListener('scroll', scroller, false);
  } else {
    if (window.attachEvent) {
      window.attachEvent('onload', ready);
      window.attachEvent('onscroll', scroller);
    }
  }
  w.hljs.initHighlightingOnLoad();
})(window);
