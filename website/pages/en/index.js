/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

class HomeSplash extends React.Component {
  render() {
    const { siteConfig, language = '' } = this.props;
    const { baseUrl, docsUrl } = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const Logo = props => (
      <div className="projectLogo">
        <img src={props.img_src} alt="Project Logo" />
      </div>
    );

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        {siteConfig.title}
        <small>{siteConfig.tagline}</small>
      </h2>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <Logo img_src={`${baseUrl}img/undraw_dev_productivity_umsq.svg`} />
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />
          <PromoSection>
            <Button href={docUrl('get-started/setup.html')}>Get started</Button>
            <Button href={docUrl('documentation/benchmark/analytics.html')}>Documentation</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const { config: siteConfig, language = '' } = this.props;
    const { baseUrl } = siteConfig;

    const Block = props => (
      <Container
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}>
        <GridBlock
          align="center"
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    );

    const FeatureCallout = () => (
      <div
        className="productShowcaseSection paddingBottom"
        style={{ textAlign: 'center' }}>
        <h2>Key Features</h2>
        <ul style={{ listStyle: "none" }}>
          <li>Familiar approach to Mocha.js</li>
          <li>Running each benchmark in child process to isolate it</li>
          <li>Broad variety of default exporters</li>
          <li>Possible to write custom exporter</li>
          <li>Typescript support</li>
          <li>Easy structuring to keep an overview</li>
          <li>Dynamic warmup procedure - less manual configuration</li>
        </ul>
      </div>
    );

    const TryOut = () => (
      <Block id="try">
        {[
          {
            content:
              'This is one of the major use cases of zakzak. You can run the benchmarks in your' +
              ' CI, just like your unit tests and then report the results.' +
              ' Write your custom exporter to make this work with any CI framework.' +
              ' See how your changes to the code have affected the performance.',
            image: `${baseUrl}img/undraw_dark_analytics_7axy.svg`,
            imageAlign: 'left',
            title: 'Run in your Continuous Integration',
          },
        ]}
      </Block>
    );

    const Description = () => (
      <Block background="dark">
        {[
          {
            content:
              'This project was made public and open source to enable other people to use it, give feedback and contribute to make it better.' +
              ' Contributing is as easy as forking the repo, adding stuff and making a pull request.' +
              ' If you need more information read the contributing guidelines and maybe the docs about the internal working to see how stuff works.',
            image: `${baseUrl}img/undraw_code_typing_7jnv.svg`,
            imageAlign: 'right',
            title: 'Contributions are welcome',
          },
        ]}
      </Block>
    );

    const LearnHow = () => (
      <Block background="light">
        {[
          {
            content:
              'Using a Unit-test based approach, it is easier than ever, to create microbenchmarks' +
              ' for code in your projects. You can reuse the concepts and infrastructure that you' +
              ' use for unit testing, but instead get some numbers on the performance of your code.',
            image: `${baseUrl}img/undraw_visual_data_b1wx.svg`,
            imageAlign: 'right',
            title: 'Microbenchmark your applications',
          },
        ]}
      </Block>
    );

    const Features = () => (
      <Block layout="fourColumn">
        {[
          {
            content: 'Using the more accurate high resolution timer of Node.js and some fancy mathematics, we can achieve very consistent and accurate results',
            image: `${baseUrl}img/undraw_fast_loading_0lbh.svg`,
            imageAlign: 'top',
            title: 'Fast and accurate',
          },
          {
            content: 'Zakzak employs a unit testing like approach, closely mirroring projects such as Mocha.js. This is especially useful in bigger projects to structure the benchmarks better.',
            image: `${baseUrl}img/undraw_done_checking_ty9a.svg`,
            imageAlign: 'top',
            title: 'Unit testing approach',
          },
        ]}
      </Block>
    );

    const Showcase = () => {
      if ((siteConfig.users || []).length === 0) {
        return null;
      }

      const showcase = siteConfig.users
        .filter(user => user.pinned)
        .map(user => (
          <a href={user.infoLink} key={user.infoLink}>
            <img src={user.image} alt={user.caption} title={user.caption} />
          </a>
        ));

      const pageUrl = page => baseUrl + (language ? `${language}/` : '') + page;

      return (
        <div className="productShowcaseSection paddingBottom">
          <h2>Who is Using This?</h2>
          <p>This project is used by all these people</p>
          <div className="logos">{showcase}</div>
          <div className="more-users">
            <a className="button" href={pageUrl('users.html')}>
              More {siteConfig.title} Users
            </a>
          </div>
        </div>
      );
    };

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <Features />
          <FeatureCallout />
          <LearnHow />
          <TryOut />
          <Description />
          <Showcase />
        </div>
      </div>
    );
  }
}

module.exports = Index;
