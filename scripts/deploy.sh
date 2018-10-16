#!/usr/bin/env bash

if [ $CIRCLE_BRANCH = "master" ]
  then
    echo ${NOW_PRODUCTION} > ./now.json
fi

if [ $CIRCLE_BRANCH = "develop" ]
  then
    echo ${NOW_STAGING} > ./now.json
fi

[ -z "$ENVIRONMENT" ] && ENVIRONMENT="development" && exit

now --token $ZEIT_TOKEN