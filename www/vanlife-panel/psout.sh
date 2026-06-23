#!/bin/sh
ps aux > /config/www/vanlife-panel/ps_output.txt 2>&1
echo "--- netstat ---" >> /config/www/vanlife-panel/ps_output.txt
netstat -tlnp >> /config/www/vanlife-panel/ps_output.txt 2>&1
echo "--- pkill test ---" >> /config/www/vanlife-panel/ps_output.txt
pkill --help >> /config/www/vanlife-panel/ps_output.txt 2>&1
echo "done" >> /config/www/vanlife-panel/ps_output.txt
