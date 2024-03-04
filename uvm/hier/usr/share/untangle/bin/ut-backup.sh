#! /bin/bash

#=============================================================
# Little script which creates a backup of the system settings state
# Excluding "config" information, like UID, etc.
#==============================================================

VERBOSE=false

function debug() 
{
    if [ "true" == $VERBOSE ]; then
        echo $*
    fi
}

function err() 
{
    echo $* >> /dev/stderr
}

function doHelp() 
{
    echo "$0 -o (output file) -h (help) -v (verbose)"
}

# $1 = tar file
# $2 = dir with backups files
function tarBackupFiles() 
{
    debug "Taring files in $2 into tar $1"
    pushd $2 > /dev/null 2>&1
    tar -cf $1 .
    popd > /dev/null 2>&1
    TAR_EXIT=$?
    debug "Done creating tar with return code $TAR_EXIT"
}

function backupSettings()
{
    # create a tmp directory to store settings
    temp=`mktemp -d -t ut-backup-files.XXXXXXXXXX`
    mkdir -p $temp/usr/share/untangle/settings

    # copy settings files to tmp directory
    # only match specific versions without the date/version info so we don't backup old files
    # use -L so symlinks are dereferenced
    find /usr/share/untangle/settings/ \( -type f -o -type l \) -regextype sed ! -regex '.*/.*-version-[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}-[0-9\.]*\.js' -exec cp -L --parents {} $temp/ \;

    # Copy branding image if present
    VAR_IMAGES_DIR=/var/www/images
    BRANDING_LOGO_FILE=$VAR_IMAGES_DIR/BrandingLogo.png
    if [ -f "$BRANDING_LOGO_FILE" ]; then
        cp $BRANDING_LOGO_FILE $temp/usr/share/untangle/settings/
    fi
    
    # tar up important files
    tar zcfh $1 --ignore-failed-read -C $temp usr/share/untangle/settings/

    # remove tmp dir
    rm -rf $temp
}

# $1 = dir to put backup files
function backupToDir()
{
    outdir=$1

    datestamp=$(date '+%Y%m%d%H%M')

    # create a tarball of settings files
    backupSettings $outdir/files-$datestamp.tar.gz

    # save the version of this backup
    cp @PREFIX@/usr/share/untangle/lib/untangle-libuvm-api/PUBVERSION $outdir/
}


while getopts "ho:v" opt; do
    case $opt in
        h) doHelp;exit 0;;
        o) OUT_FILE=$OPTARG;;
        v) VERBOSE=true;;
    esac
done

if [ -z "$OUT_FILE" ]; then
    err "Please provide an output file";
    doHelp; exit 1;
fi

debug "Outputting to file: " $OUT_FILE

# Create the backups into a directory we provide
DUMP_DIR=`mktemp -d -t ut-backup.XXXXXXXXXX`
backupToDir $DUMP_DIR

# Tar the contents of the temp directory
TAR_FILE=`mktemp -t ut-backup.XXXXXXXXXX`
tarBackupFiles $TAR_FILE $DUMP_DIR

debug "Remove dump dir"
rm -rf $DUMP_DIR

debug "Gzipping $TAR_FILE"
gzip $TAR_FILE

debug "Copy bundle to $OUT_FILE"
mv $TAR_FILE.gz $OUT_FILE


