import { Box, Grid, Link, Paper, Tooltip, makeStyles } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { LabelChip, Status, StatusChip } from 'src/components/Chip';
import BondLogo from 'src/components/BondLogo';
import CustomButton from 'src/components/Button/CustomButton';
import './choose-bond.scss';

import { useMemo } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useSelector } from 'src/store/hook';
import { useTranslation } from 'react-i18next';
import { useWeb3Context } from '../../hooks';

import { BondKey, getBond } from 'src/constants';
import { priceUnits, trim, prettyShortVestingPeriod, localeString } from '../../helpers';

const useStyles = makeStyles(theme => ({
  white: {
    '& ': {
      backgroundColor: theme.palette.mode.white,
    },
  },
}));
interface IBondProps {
  bondKey: BondKey;
}

function BondRow({ bondKey }: IBondProps) {
  const { chainID } = useWeb3Context();
  // Use BondPrice as indicator of loading.
  const isBondLoading = useSelector(state => !state.bonding[bondKey]?.bondPrice ?? true);
  const bond = getBond(bondKey, chainID);

  const bondPrice = useSelector(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].bondPrice;
  });
  const bondDiscount = useSelector(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].bondDiscount;
  });
  const bondPurchased = useSelector(state => {
    return state.bonding[bondKey] && state.bonding[bondKey].purchased;
  });
  const fiveDayRate = useSelector(state => state.app.fiveDayRate);
  const marketPrice = useSelector(state => state.bonding[bondKey]?.marketPrice);
  const myBalance = useSelector(state => {
    //@ts-ignore
    return state.account[bondKey] && state.account[bondKey].interestDue;
  });
  const priceDiff = (Number(marketPrice) ?? 0) - (bondPrice ?? 0);
  const { t, i18n } = useTranslation();
  const currentBlockTime = useSelector(state => state.app.currentBlockTime);
  const bondMaturationTime = useSelector(state => {
    //@ts-ignore
    return state.account[bondKey] && state.account[bondKey].bondMaturationTime;
  });

  const vestingTime = useMemo(
    () => prettyShortVestingPeriod(t, currentBlockTime, bondMaturationTime),
    [currentBlockTime, bondMaturationTime],
  );
  const fullyVested = currentBlockTime > bondMaturationTime && bondMaturationTime > 0;

  const styles = useStyles();

  const redeemable = fullyVested ? 'redeem' : 'bond';
  const history = useHistory();
  const redirect = () => {
    history.push(`/bonds/${bondKey}?action=${redeemable}`);
  };
  return (
    <Grid container id={`${bondKey}--bond`} className={`bond-row ${styles.white}`} onClick={redirect}>
      <Grid item xs={1}>
        <BondLogo bond={bond} />
      </Grid>
      <Grid item xs={2} className="bond-row-value first-col">
        <p>{bond.name}</p>
        {bond.deprecated ? (
          <LabelChip label={`${t('bonds.deprecated')}`} className="bond-name-label" />
        ) : (
          <Link color="primary" href={bond.dexUrl} target="_blank">
            <Box component="p" color="otter.otterBlue">
              {bond.type === 'lp' ? `${t('common.addLiquidity')}` : `${t('common.buyThing')}${bond.reserveUnit}`}
            </Box>
          </Link>
        )}
      </Grid>

      <Grid item xs={2} className="bond-row-value">
        <p className="bond-price-text">
          <span className="currency-icon">{priceUnits(bondKey)}</span>
          <span>{isBondLoading ? <Skeleton width="50px" /> : bond.deprecated ? '-' : trim(bondPrice, 2)}</span>
        </p>
        {priceDiff > 0 && (
          <StatusChip status={Status.Success} label={`$${trim(priceDiff, 2)} ${t('bonds.bondDiscount')}`} />
        )}
      </Grid>
      <Grid item xs={1} className="bond-row-value">
        <p>
          {isBondLoading ? <Skeleton /> : bond.deprecated ? '-' : `${trim(bondDiscount * 100, 2)}%`}
          {!bond.deprecated && bond.autostake && (
            <Tooltip title={`* ${t('bonds.purchase.roiFourFourInfo')} `}>
              <span>{` + ${trim(fiveDayRate * 100, 2)}%*`}</span>
            </Tooltip>
          )}
        </p>
      </Grid>
      <Grid item xs={2} className="bond-row-value">
        <p>
          {isBondLoading ? (
            <Skeleton />
          ) : bond.deprecated ? (
            '-'
          ) : (
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
              minimumFractionDigits: 0,
            }).format(bondPurchased)
          )}
        </p>
      </Grid>
      <Grid item xs={2} className="bond-row-value">
        {myBalance ? `${trim(myBalance, 2)} ${bond.autostake ? 'sCLAM' : 'CLAM'}` : '-'}
      </Grid>
      <Grid item xs={2} className="bond-row-value">
        {fullyVested ? (
          <Link component={NavLink} to={`/bonds/${bondKey}?action=redeem`}>
            {/* FIXME: modify desc from redeem to clain now */}
            <CustomButton bgcolor="otter.otterBlue" color="otter.white" text={`${t('common.redeem')}`} />
          </Link>
        ) : vestingTime ? (
          <div>
            <p>
              {new Date(bondMaturationTime * 1000).toLocaleString(localeString(i18n), {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p>{vestingTime}</p>
          </div>
        ) : (
          <p className="bond-row-value">-</p>
        )}
      </Grid>
    </Grid>
  );
}
export default BondRow;
