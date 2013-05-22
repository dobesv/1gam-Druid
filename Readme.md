# Druid

Build your own little ecosystem in a post-apocalyptic earth.

## Credits

Original artwork by [Glenn Martin](http://bunyep.com).

Programming by [Dobes Vandermeer](http://dobesv.com).

## Repacking The Spritesheet

The app uses one big sprite sheet for most of the images.  Use [TexturePacker](http://www.codeandweb.com/texturepacker)
to repack the sprite sheet if you make changes.

First you'll have to set the TexturePacker exporters folder to the texturepacker-exporter folder in here, or
copy its contents to your existing TexturePacker exporter folder.

Then you can open images/spritesheet.tps in TexturePacker and click Publish to build a new spritesheet.png.

## Building for CocoonJS

To make a CocoonJS compatible ZIP file, add these to a zip file, preserving their relative path from this folder:

* images
* js
* playcraftjs
* sounds/*.mp3
* index.html

## Deploying CocoonJS Build to Android

Here are the commands needed to sign, align, and deploy the release build from CocoonJS:

    jarsigner -verbose -sigalg MD5withRSA -digestalg SHA1 *_release_unsigned.apk apk
    jarsigner -verify *_release_unsigned.apk
    zipalign -v 4 *_release_unsigned.apk Druid.apk
    adb install -r Druid.apk

Note the "install -r" means reinstall.  Remove -r on the last one if it's not already installed.

## Deploying CocoonJS Build to iOS

Here are the steps needed to package the app for iOS and create a signed IPA for Ad-Hoc distribution.

1. Get yourself on a Mac with Xcode  (sadly, no windows steps currently)
2. Open up the xcode project from the zip file
3. From the menu, choose Product > Archive
4. Select the newly created archive in the "Organizer" that pops up, and click Distribute...
5. Choose "Save for Enterprise or Ad-Hoc Deployment"
6. Choose the code signing identity that has the right devices associated.

Full instructions are here: http://wiki.ludei.com/cocoonjs:xcodeproject


## Legal

The game, its source code, and its audio assets are provided as-is without any warrantees as to their suitability
for any purpose.  Use at your own risk.

Graphics and audio are provided for example purposes only and may only be re-used with explicit permission from
their creators.

The javascript and HTML source code can be copied and re-used freely in other projects.  Consider it public domain.




