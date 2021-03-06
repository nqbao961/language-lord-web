import styles from './Play.module.scss';
import Profile from './components/Profile';
import ScoreHint from './components/ScoreHint';
import Rank from './components/Rank';
import Setting from './components/Setting';
import {
  useAppDispatch,
  useAppSelector,
  useSounds,
} from '../../services/hooks';
import { Button } from '../../components';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import Ready from './components/Ready';
import { PlayState } from './type';
import { getLevel } from '../../services/@redux/actions';
import Playing from './components/Playing';
import { Level } from '../../services/models';
import logo from '../../assets/images/logo-lang.png';
import Result from './components/Result';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import {
  updatePlayingLevel,
  getLevelTotal,
} from '../../services/@redux/actions/app';
import * as api from '../../services/api';

export default function Play() {
  const [playState, setPlayState] = useState<PlayState>('selectLevel');
  const [countDown, setCountDown] = useState(0);
  const [intervalId, setIntervalId] = useState<any>(0);
  const [currentLevel, setCurrentLevel] = useState<Level>();

  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user);
  const app = useAppSelector(state => state.app);
  const isFirstRun = useRef(true);

  const themeSound = useSounds('theme');

  const onClickPlayLevel = () => {
    dispatch(
      getLevel(`${user.preferedLang}-${user.level[user.preferedLang]}`)
    ).then(level => {
      dispatch(updatePlayingLevel(level.levelNumber));
      setCurrentLevel(level);
      setCountDown(3);
      handleCountDown();
      setPlayState('ready');
    });
  };

  const replay = () => {
    setCountDown(3);
    handleCountDown();
    setPlayState('ready');
  };

  function handleCountDown() {
    const timer = setInterval(() => {
      setCountDown(countDown => countDown - 1);
    }, 1000);
    setIntervalId(timer);
  }

  useEffect(() => {
    dispatch(getLevelTotal());
    document.body.classList.add('play');

    const playTheme = () => {
      themeSound.play();
    };
    document.addEventListener('click', playTheme, { once: true });
    document.addEventListener('touchstart', playTheme, { once: true });

    return () => {
      document.removeEventListener('click', playTheme);
      document.removeEventListener('touchstart', playTheme);
    };
  }, []);

  useEffect(() => {
    playState === 'playing' && themeSound.pause();
    playState === 'selectLevel' && themeSound.play();
  }, [playState]);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));

    if (isFirstRun.current || localStorage.getItem('token') === 'guest') {
      isFirstRun.current = false;
      return;
    } else {
      api.updateUser({
        preferedLang: user.preferedLang,
        level: user.level,
        score: user.score,
        hint: user.hint,
        completedQuizzes: user.completedQuizzes,
      });
    }
  }, [user]);

  useEffect(() => {
    countDown === -1 && clearInterval(intervalId);
  }, [countDown]);

  return (
    <div className={styles.container}>
      <CSSTransition
        in={playState !== 'playing'}
        timeout={300}
        unmountOnExit
        classNames={{
          enter: styles.contentEnter,
          enterActive: styles.contentEnterActive,
          exit: styles.contentExit,
          exitActive: styles.contentExitActive,
        }}
      >
        <div className={styles.header}>
          <div className={styles.headerWrapper}>
            <Profile />
            <ScoreHint />
          </div>
          <div className={styles.headerWrapper}>
            <Rank />
            <Setting themeSound={themeSound.sound} />
          </div>
        </div>
      </CSSTransition>

      <SwitchTransition>
        <CSSTransition
          key={playState}
          addEndListener={(node, done) => {
            node.addEventListener('transitionend', done, false);
          }}
          classNames={{
            enter: styles.playEnter,
            enterActive: styles.playEnterActive,
            exit: styles.playExit,
            exitActive: styles.playExitActive,
          }}
        >
          <div className={styles.mainContent}>
            {playState === 'selectLevel' && (
              <div className={styles.selectLevelContainer}>
                <div className={styles.selectLevelLogo}>
                  <div className={styles.selectLevelText}>{`${t('Welcome')}, ${
                    user.name
                  }!`}</div>
                  <img src={logo} alt="logo" />
                </div>
                {app.levelTotal[user.preferedLang] >=
                user.level[user.preferedLang] ? (
                  <Button
                    className={`${styles.playLevelButton} ${styles.bigFont}`}
                    label={`${t('Level')} ${user.level[user.preferedLang]}`}
                    handleClick={onClickPlayLevel}
                  />
                ) : (
                  <div className={styles.selectLevelText}>
                    {t('Well done! Stay tuned for upcoming levels!')}
                  </div>
                )}
              </div>
            )}
            {playState === 'ready' && (
              <Ready countDown={countDown} setPlayState={setPlayState} />
            )}
            {playState === 'playing' && currentLevel && (
              <Playing level={currentLevel} setPlayState={setPlayState} />
            )}
            {playState === 'result' && (
              <Result
                setPlayState={setPlayState}
                replay={replay}
                handleNextLevel={onClickPlayLevel}
              />
            )}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}
