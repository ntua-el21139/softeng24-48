@echo off
SETLOCAL EnableDelayedExpansion

cd ..\cli-client

python se2448.py healthcheck
pause
echo.

python se2448.py resetpasses
pause
echo.

python se2448.py healthcheck
pause
echo.

python se2448.py resetstations
pause
echo.

python se2448.py healthcheck
pause
echo.

python se2448.py admin --addpasses --source passes48.csv
pause
echo.

python se2448.py healthcheck
pause
echo.

python se2448.py tollstationpasses --station AM08 --from 20220407 --to 20220421 --format json
pause
echo.

python se2448.py tollstationpasses --station NAO04 --from 20220407 --to 20220421 --format csv
pause
echo.

python se2448.py tollstationpasses --station NO01 --from 20220407 --to 20220421 --format csv
pause
echo.

python se2448.py tollstationpasses --station OO03 --from 20220407 --to 20220421 --format csv
pause
echo.

python se2448.py tollstationpasses --station XXX --from 20220407 --to 20220421 --format csv
pause
echo.

python se2448.py tollstationpasses --station OO03 --from 20220407 --to 20220421 --format YYY
pause
echo.

python se2448.py errorparam --station OO03 --from 20220407 --to 20220421 --format csv
pause
echo.

python se2448.py tollstationpasses --station AM08 --from 20220408 --to 20220419 --format json
pause
echo.

python se2448.py tollstationpasses --station NAO04 --from 20220408 --to 20220419 --format csv
pause
echo.

python se2448.py tollstationpasses --station NO01 --from 20220408 --to 20220419 --format csv
pause
echo.

python se2448.py tollstationpasses --station OO03 --from 20220408 --to 20220419 --format csv
pause
echo.

python se2448.py tollstationpasses --station XXX --from 20220408 --to 20220419 --format csv
pause
echo.

python se2448.py tollstationpasses --station OO03 --from 20220408 --to 20220419 --format YYY
pause
echo.

python se2448.py passanalysis --stationop AM --tagop NAO --from 20220407 --to 20220421 --format json
pause
echo.

python se2448.py passanalysis --stationop NAO --tagop AM --from 20220407 --to 20220421 --format csv
pause
echo.

python se2448.py passanalysis --stationop NO --tagop OO --from 20220407 --to 20220421 --format csv
pause
echo.

python se2448.py passanalysis --stationop OO --tagop KO --from 20220407 --to 20220421 --format csv
pause
echo.

python se2448.py passanalysis --stationop XXX --tagop KO --from 20220407 --to 20220421 --format csv
pause
echo.

python se2448.py passanalysis --stationop AM --tagop NAO --from 20220408 --to 20220419 --format json
pause
echo.

python se2448.py passanalysis --stationop NAO --tagop AM --from 20220408 --to 20220419 --format csv
pause
echo.

python se2448.py passanalysis --stationop NO --tagop OO --from 20220408 --to 20220419 --format csv
pause
echo.

python se2448.py passanalysis --stationop OO --tagop KO --from 20220408 --to 20220419 --format csv
pause
echo.

python se2448.py passanalysis --stationop XXX --tagop KO --from 20220408 --to 20220419 --format csv
pause
echo.

python se2448.py passescost --stationop AM --tagop NAO --from 20220407 --to 20220421 --format json
pause
echo.

python se2448.py passescost --stationop NAO --tagop AM --from 20220407 --to 20220421 --format csv
pause
echo.

python se2448.py passescost --stationop NO --tagop OO --from 20220407 --to 20220421 --format csv
pause
echo.

python se2448.py passescost --stationop OO --tagop KO --from 20220407 --to 20220421 --format csv
pause
echo.

python se2448.py passescost --stationop XXX --tagop KO --from 20220407 --to 20220421 --format csv
pause
echo.

python se2448.py passescost --stationop AM --tagop NAO --from 20220408 --to 20220419 --format json
pause
echo.

python se2448.py passescost --stationop NAO --tagop AM --from 20220408 --to 20220419 --format csv
pause
echo.

python se2448.py passescost --stationop NO --tagop OO --from 20220408 --to 20220419 --format csv
pause
echo.

python se2448.py passescost --stationop OO --tagop KO --from 20220408 --to 20220419 --format csv
pause
echo.

python se2448.py passescost --stationop XXX --tagop KO --from 20220408 --to 20220419 --format csv
pause
echo.

python se2448.py chargesby --opid NAO --from 20220407 --to 20220421 --format json
pause
echo.

python se2448.py chargesby --opid GE --from 20220407 --to 20220421 --format csv
pause
echo.

python se2448.py chargesby --opid OO --from 20220407 --to 20220421 --format csv
pause
echo.

python se2448.py chargesby --opid KO --from 20220407 --to 20220421 --format csv
pause
echo.

python se2448.py chargesby --opid NO --from 20220407 --to 20220421 --format csv
pause
echo.

python se2448.py chargesby --opid NAO --from 20220408 --to 20220419 --format json
pause
echo.

python se2448.py chargesby --opid GE --from 20220408 --to 20220419 --format csv
pause
echo.

python se2448.py chargesby --opid OO --from 20220408 --to 20220419 --format csv
pause
echo.

python se2448.py chargesby --opid KO --from 20220408 --to 20220419 --format csv
pause
echo.

python se2448.py chargesby --opid NO --from 20220408 --to 20220419 --format csv 