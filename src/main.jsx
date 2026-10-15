import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/vt323/400.css';
import './style.css';
import './ui/ui.css';
import './ui/portfolio.css';

import ReactDOM from 'react-dom/client';

import Experience from './Experience.jsx';
import { SceneErrorBoundary, StaticPortfolio } from './ui/Fallbacks';
import Hud from './ui/Hud';
import Intro from './ui/Intro';
import { hasWebGL } from './ui/webgl';

const root = ReactDOM.createRoot(document.querySelector('#root'));

root.render(
    hasWebGL() ? (
        <>
            <div className="backdrop" aria-hidden="true">
                <div className="backdrop__layer backdrop__layer--day" />
                <div className="backdrop__layer backdrop__layer--night" />
                <div className="backdrop__layer backdrop__layer--overdrive" />
            </div>
            <SceneErrorBoundary>
                <Experience />
                <Hud />
                <Intro />
            </SceneErrorBoundary>
        </>
    ) : (
        <StaticPortfolio
            title="This browser can’t show the 3D room."
            message="WebGL is unavailable or disabled, so here is the text version. Try a recent Chrome, Edge, Firefox or Safari with hardware acceleration on."
        />
    )
);
