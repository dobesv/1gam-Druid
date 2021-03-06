<!DOCTYPE html>
<html>
<head>
    <title>Laser Puzzle</title>
    <!--<meta name="viewport" content="width=device-width; initial-scale=1; maximum-scale=1; user-scalable=0;"/>-->
    <meta name="viewport" content="user-scalable=no, maximum-scale=1.0, width=device-width, height=device-height"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>

</head>

<body>
<script>
    (function() {
        var pcBaseUrl = 'playcraftjs/';
        var pcVersion = '0.5.6';
        var gameScriptBaseUrl = 'js/';
        var gameMainClass = 'TheGame';
        var gameEltId = 'pcGameCanvas';
        var gameScripts = [
            // add extra files here, e.g.
            'utils.js',
            'grid.js',
            'levels.js',
            'imagelayer.js',
            'laserlayer.js',
            'menulayer.js',
            'doorlayer.js',
            'components/pivot.js',
            'components/filter.js',
            'systems/pivots.js',
            'gamescene.js',
            'game.js'];

        var production = (document.location.hostname != "localhost");
        var mainScript = production ? pcBaseUrl+"dist/playcraft-"+pcVersion+".min.js" : pcBaseUrl+"lib/playcraft.js";
        var head = document.getElementsByTagName("head")[0];
        var scriptTag = document.createElement('script');
        scriptTag.type = "text/javascript" ;
        scriptTag.src = mainScript;
        scriptTag.onload = function() {
            //pc.device.devMode = !production;
            pc.start(gameEltId, gameMainClass, gameScriptBaseUrl, gameScripts, pcBaseUrl+'lib/');
        };
        scriptTag.onreadystatechange = function() {
            if(this.readyState == 'complete') {
                this.onload();
            }
        }
        head.appendChild(scriptTag);

    })();
</script>
<div style='position: absolute; width: 100%; height: 100%; padding:0; margin:0; left:0; top:0'>
    <div id="center1" style='background-color: #000; height: 100%; width:100%'>
        <canvas id="pcGameCanvas"></canvas>
    </div>
</div>

<!--
<a href="https://github.com/dobesv/1gam-LaserPuzzle"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_white_ffffff.png" alt="Fork me on GitHub"></a>
-->
<script type="text/javascript">

    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-24340079-2']);
    _gaq.push(['_trackPageview']);

    (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();

</script>


</body>
</html>
