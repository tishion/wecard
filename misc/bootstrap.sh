#!/bin/bash

# Copy the service file

cp /var/www/wecard-api/misc/wecard.service /etc/systemd/system/wecard.service
systemctl enable wecardapi