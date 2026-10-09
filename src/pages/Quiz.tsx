import { useEffect, useMemo, useRef, useState, type FormEvent, type MutableRefObject } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, CloseIcon } from '../components/Icons';
import { MoodArt } from '../components/MoodArt';
import { ARCHETYPES } from '../data/archetypes';
import {
  REQUIRED_QUESTION_COUNT,
  getQuestion,
  visibleQuestions,
  type Answer,
  type Answers,
  type Question,
} from '../data/quiz';
import { track } from '../lib/consent';
import { computeMatch, encodeAnswers } from '../lib/matching';
import { clearProgress, loadProgress, loadResult, saveProgress, saveResult } from '../lib/quizStore';
import { usePageMeta } from '../lib/usePageMeta';

const AUTO_ADVANCE_MS = 420;

export default function Quiz() {
  usePageMeta(
    'Discover Your AURA',
    'Der AURA Duftfinder: zehn kurze Fragen zu Stil, Stimmung und Lieblingsnoten. Dein persönliches Duftprofil in 2–3 Minuten, ohne Anmeldung.',
  );
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [saved] = useState(loadProgress);
  const [lastResult] = useState(loadResult);
  const startNow = params.has('start');

  const [answers, setAnswers] = useState<Answers>(() => {
    if (!startNow) return saved?.answers ?? {};
    const preset = params.get('universe');
    return preset && getQuestion('universe').answers.some((a) => a.id === preset) ? { universe: [preset] } : {};
  });
  const [step, setStep] = useState(startNow ? 0 : -1);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [advanceToken, setAdvanceToken] = useState(0);
  const [showError, setShowError] = useState(false);
  const pointerRef = useRef(false);
  const startedRef = useRef(false);

  const questions = useMemo(() => visibleQuestions(answers), [answers]);
  const question = step >= 0 ? questions[step] : undefined;
  const selected = question ? (answers[question.id] ?? []) : [];
  const answered = selected.length > 0;
  const isLast = step === questions.length - 1;

  useEffect(() => {
    if (step >= 0) saveProgress({ answers, step, updatedAt: Date.now() });
  }, [answers, step]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setShowError(false);
    if (step === 0 && !startedRef.current) {
      startedRef.current = true;
      track('quiz_start');
    }
  }, [step]);

  // Einzelauswahl per Tippen springt automatisch weiter; Tastaturnutzer behalten die Kontrolle.
  useEffect(() => {
    if (!advanceToken) return;
    const timer = window.setTimeout(goNext, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
    // goNext liest bewusst den Stand des Renders, der das Weiterspringen ausgelöst hat.
  }, [advanceToken]);

  function begin(fresh: boolean) {
    setDirection('forward');
    if (fresh) {
      clearProgress();
      setAnswers({});
      setStep(0);
      return;
    }
    setStep(Math.max(0, Math.min(saved?.step ?? 0, visibleQuestions(answers).length - 1)));
  }

  function select(q: Question, answer: Answer) {
    setAnswers((prev) => {
      const current = prev[q.id] ?? [];
      let next: string[];
      if (q.kind === 'single') next = [answer.id];
      else if (current.includes(answer.id)) next = current.filter((id) => id !== answer.id);
      else if (answer.exclusive) next = [answer.id];
      else next = [...current.filter((id) => !q.answers.find((a) => a.id === id)?.exclusive), answer.id];

      const updated: Answers = { ...prev, [q.id]: next };
      if (q.id === 'purpose' && next[0] === 'exploring') delete updated.budget;
      return updated;
    });
    setShowError(false);
    if (q.kind === 'single' && pointerRef.current) setAdvanceToken((t) => t + 1);
  }

  function goNext() {
    if (!question) return;
    if (!answered && !question.optional) {
      setShowError(true);
      return;
    }
    if (step < questions.length - 1) {
      setDirection('forward');
      setStep(step + 1);
    } else {
      finish(answers);
    }
  }

  function goBack() {
    setDirection('back');
    setStep((s) => s - 1);
  }

  function finish(final: Answers) {
    const code = encodeAnswers(final);
    const result = computeMatch(final);
    saveResult({ code, primary: result.primary, alternative: result.alternative, savedAt: Date.now() });
    clearProgress();
    track('quiz_complete', { profile: result.primary, fit: result.fit });
    navigate(`/duftfinder/ergebnis?r=${code}`);
  }

  function skipBudget() {
    const withoutBudget = { ...answers };
    delete withoutBudget.budget;
    finish(withoutBudget);
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    goNext();
  };

  if (!question) {
    const canResume = !startNow && saved !== null && saved.step >= 0 && Object.keys(saved.answers).length > 0;
    return (
      <div className="quiz-intro grain">
        <div className="quiz-intro__aura" aria-hidden="true" />
        <QuizBar />
        <div className="container quiz-intro__inner">
          <p className="eyebrow">Der AURA Duftfinder</p>
          <h1 className="quiz-intro__title">
            Discover <em>your AURA</em>
          </h1>
          <p className="quiz-intro__sub">Your scent. Your energy. Your identity.</p>
          <p className="quiz-intro__text">
            Beantworte ein paar Fragen zu deinem Stil, deiner Stimmung und den Düften, die du liebst. Entdecke das
            Duftprofil, das sich am meisten nach dir anfühlt.
          </p>
          <div className="quiz-intro__actions">
            {canResume ? (
              <>
                <button type="button" className="btn" onClick={() => begin(false)}>
                  Weitermachen bei Frage {Math.min((saved?.step ?? 0) + 1, REQUIRED_QUESTION_COUNT)}
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => begin(true)}>
                  Neu starten
                </button>
              </>
            ) : (
              <button type="button" className="btn" onClick={() => begin(false)}>
                Find my AURA
              </button>
            )}
          </div>
          <ul className="quiz-intro__facts">
            <li>2–3 minutes</li>
            <li>No wrong answers</li>
            <li>Your personal scent profile</li>
          </ul>
          {lastResult && (
            <Link to={`/duftfinder/ergebnis?r=${lastResult.code}`} className="text-link quiz-intro__last">
              Dein letztes Ergebnis ansehen: {ARCHETYPES[lastResult.primary].name}
              <ArrowRightIcon size={16} />
            </Link>
          )}
          <p className="quiz-intro__note">
            Der Duftfinder empfiehlt Duftprofile anhand deiner Angaben. Er ist keine psychologische Diagnostik und kann
            nicht vorhersagen, wie ein Duft auf deiner Haut riecht. Deine Antworten bleiben in deinem Browser.
          </p>
        </div>
      </div>
    );
  }

  const progress = question.optional ? 1 : Math.min(1, (step + (answered ? 1 : 0)) / REQUIRED_QUESTION_COUNT);
  const counter = question.optional ? 'Optional' : `Frage ${step + 1} von ${REQUIRED_QUESTION_COUNT}`;

  return (
    <div className="quiz">
      <QuizBar counter={counter} progress={progress} />
      <form key={question.id} className={`quiz-step quiz-step--${direction}`} onSubmit={submit} noValidate>
        <div className="container quiz-step__body">
          <div className="quiz-step__head">
            <p className="eyebrow">
              {question.optional ? 'Zum Schluss' : String(step + 1).padStart(2, '0')} · {question.label}
            </p>
            <h1 className="quiz-step__title">{question.title}</h1>
            <p className="quiz-step__prompt">{question.prompt}</p>
            <p className="quiz-step__helper">{question.helper}</p>
          </div>

          <fieldset className="quiz-step__fieldset">
            <legend className="sr-only">
              {question.prompt} {question.helper}
            </legend>
            <div className={`answers answers--${question.layout} answers--n${question.answers.length}`}>
              {question.answers.map((answer) => (
                <AnswerOption
                  key={answer.id}
                  question={question}
                  answer={answer}
                  selected={selected.includes(answer.id)}
                  onSelect={() => select(question, answer)}
                  pointerRef={pointerRef}
                />
              ))}
            </div>
          </fieldset>
        </div>

        <div className="quiz-nav">
          <div className="container quiz-nav__inner">
            <button type="button" className="btn btn--ghost quiz-nav__back" onClick={goBack} aria-label="Zurück">
              <ArrowLeftIcon size={18} />
              <span>Zurück</span>
            </button>
            <p className="quiz-nav__status" role={showError ? 'alert' : undefined}>
              {showError
                ? 'Bitte wähle mindestens eine Antwort.'
                : question.kind === 'multi'
                  ? `${selected.length} ausgewählt`
                  : ''}
            </p>
            {question.optional && (
              <button type="button" className="link-button quiz-nav__skip" onClick={skipBudget}>
                Überspringen
              </button>
            )}
            <button type="submit" className={`btn quiz-nav__next ${answered || question.optional ? '' : 'is-waiting'}`}>
              <span>{isLast ? 'Ergebnis zeigen' : 'Weiter'}</span>
              <ArrowRightIcon size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function QuizBar({ counter, progress }: { counter?: string; progress?: number }) {
  return (
    <header className="quiz-bar">
      <div className="container quiz-bar__inner">
        <Link to="/" className="logo logo--sm" aria-label="AURA Startseite">
          AURA
        </Link>
        {counter && <p className="quiz-bar__count">{counter}</p>}
        <Link to="/" className="icon-btn" aria-label="Duftfinder verlassen">
          <CloseIcon size={22} />
        </Link>
      </div>
      {progress !== undefined && (
        <div
          className="quiz-progress"
          role="progressbar"
          aria-label="Fortschritt im Duftfinder"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      )}
    </header>
  );
}

interface AnswerOptionProps {
  question: Question;
  answer: Answer;
  selected: boolean;
  onSelect: () => void;
  pointerRef: MutableRefObject<boolean>;
}

function AnswerOption({ question, answer, selected, onSelect, pointerRef }: AnswerOptionProps) {
  const type = question.kind === 'single' ? 'radio' : 'checkbox';
  const inputId = `q-${question.id}-${answer.id}`;
  const wide = question.layout === 'art' && answer.exclusive;
  return (
    <label
      htmlFor={inputId}
      className={`answer answer--${question.layout} ${selected ? 'is-selected' : ''} ${wide ? 'answer--wide' : ''}`}
      onPointerDown={() => {
        pointerRef.current = true;
      }}
    >
      <input
        id={inputId}
        className="sr-only"
        type={type}
        name={question.id}
        value={answer.id}
        checked={selected}
        onChange={onSelect}
        onClick={() => {
          // Erneutes Tippen auf die bereits gewählte Antwort springt ebenfalls weiter.
          if (type === 'radio' && selected) onSelect();
        }}
        onKeyDown={() => {
          pointerRef.current = false;
        }}
      />
      {question.layout === 'art' && answer.art && (
        <span className="answer__art grain">
          <MoodArt art={answer.art} />
        </span>
      )}
      <span className="answer__text">
        <span className="answer__label">{answer.label}</span>
        <span className="answer__desc">{answer.description}</span>
      </span>
      <span className="answer__check" aria-hidden="true">
        <CheckIcon size={14} />
      </span>
    </label>
  );
}
