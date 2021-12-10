import { useTranslation, Trans } from 'react-i18next';
import { useState } from 'react';
import { Link, Popper, Box, Fade, Button, makeStyles, Paper } from '@material-ui/core';
import './language-picker.scss';

//Add new translations to the dropdown here!
const lngs: any = {
  en: { nativeName: 'English' },
  no: { nativeName: 'Norsk' },
  id: { nativeName: 'Bahasa' },
  tl: { nativeName: 'Tagalog' },
};
const useStyles = makeStyles(theme => ({
  popperMenu: {
    '& .select-language:hover': {
      backgroundColor: theme.palette.mode.lightGray200,
    },
  },
}));
interface Props {
  border: Boolean;
}
function LanguagePicker(props: Props) {
  const { t, i18n } = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event: any, lng: string) => {
    i18n.changeLanguage(lng);
    i18n.reloadResources();
    //translations aren't reloading correctly for all components,
    //force reload
    window.location.reload();
  };
  const handleMouseOver = (event: any) => {
    setlangDropdownOpen(true);
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };
  const handleMouseExit = () => {
    setlangDropdownOpen(false);
    setAnchorEl(null);
  };

  const styles = useStyles();
  const getStyle = (lng: string) => {
    return i18n.resolvedLanguage === lng ? 'bold' : 'normal';
  };
  const id = 'lang-popper';
  const [langDropdownOpen, setlangDropdownOpen] = useState(false);

  return (
    <Box onMouseEnter={e => handleMouseOver(e)} onMouseLeave={() => handleMouseExit()} id="lang-menu-button-hover">
      <Box className={`lang-button-border-${props.border.toString()}`} color="text.primary">
        {t('common.language')}
        <Popper
          className={`${styles.popperMenu} ohm-menu`}
          id={id}
          open={langDropdownOpen}
          anchorEl={anchorEl}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={400}>
              <Paper className={`lang-menu`} elevation={1}>
                <Box component="div" className="buy-tokens">
                  {Object.keys(lngs).map(lng => (
                    <Button
                      key={lng}
                      style={{ fontWeight: getStyle(lng) }}
                      type="submit"
                      onClick={e => handleClick(e, lng)}
                      className="select-language"
                    >
                      {lngs[lng].nativeName}
                    </Button>
                  ))}
                </Box>
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </Box>
  );
}

export default LanguagePicker;
