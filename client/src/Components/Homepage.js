import React from "react";
import {
  Spinner,
  Button,
  ThemeProvider,
  theme,
  CSSReset,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stack,
  Box,
  Heading,
  Text,
  Avatar,
  Progress,
} from "@chakra-ui/core";
import Background from "../images/twitter-search-feature.png";
import Typist from "react-typist";
import "../App.css";
import axios from "axios";

class Homepage extends React.Component {
  state = {
    user: null,
    loading: true,
    data: [],
    topdomains: {},
    mostShares: {},
    src: null,
    totalCount: 0,
  };

  componentDidMount() {
    const src = Background;
    const imageLoader = new Image();
    imageLoader.src = src;
    imageLoader.onload = () => {
      this.setState({ src });
    };
    axios.get("/api/auth").then((res) => {
      if (res.data.auth && !this.state.user) {
        this.setState({ user: res.data.User });
        axios
          .get("/api/home_timeline")
          .then((res) => {
            this.setState({ data: res.data.data });
            this.setState({ totalCount: res.data.total });
            this.setState({ topdomains: res.data.topDomains });
            this.setState({ mostShares: res.data.mostShares });
          })
          .catch((err) => {
            console.log(err);
          });
      }
      this.setState({ loading: false });
      // if(res.data)
      // this.setState()
    });
    // console.log(this.state.user);
  }

  handlelogin() {
    window.open("/api/login", "_self");
  }

  handlelogout = () => {
    this.setState({ user: null, data: [], topdomains: {}, mostShares: {} });
    axios.get("/api/logout");
  };

  renderTweets() {
    return this.state.data.map((ele, idx) => {
      return (
        <Box key={idx} p={5} shadow="md" borderWidth="1px">
          <Avatar name={ele.user.name} src={ele.user.profile_image_url} />
          <Heading fontSize="xl">{ele.user.name}</Heading>
          <Text mt={4}>{ele.text}</Text>
        </Box>
      );
    });
  }

  renderdomains() {
    let Domains = Object.entries(this.state.topdomains).sort(
      (a, b) => b[1].count - a[1].count
    );
    // console.log(Domains);
    return Domains.map((ele, idx) => {
      return (
        <Box key={idx} p={5} shadow="md" borderWidth="1px">
          <Heading fontSize="xl">{ele[0]}</Heading>
          <Text mt={4}>-{ele[1].name}</Text>
          <Progress
            hasStripe
            isAnimated
            value={Math.ceil((ele[1].count / this.state.totalCount) * 100)}
          />
        </Box>
      );
    });
  }

  renderSharers() {
    let Sharers = Object.entries(this.state.mostShares).sort(
      (a, b) => b[1] - a[1]
    );
    // console.log(Domains);
    return Sharers.map((ele, idx) => {
      return (
        <Box key={idx} p={5} shadow="md" borderWidth="1px">
          <Heading fontSize="xl">{ele[0]}</Heading>
          <Progress
            hasStripe
            isAnimated
            value={Math.ceil((ele[1] / this.state.data.length) * 100)}
          />
        </Box>
      );
    });
  }
  renderImage() {
    if (this.state.src) {
      document.getElementsByClassName(
        "banner"
      )[0].style.backgroundImage = `url(${this.state.src})`;
    }
  }
  render() {
    return (
      <ThemeProvider theme={theme}>
        <CSSReset />
        <div className="homepage">
          <div
            className="header"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "3.5rem",
              backgroundColor: "#4b92c3",
              position: "relative",
              boxShadow: "2px 2px 105px 1px #fff",
              // boxShadow: "5px 10px 18px red",
              zIndex: 1,
              // backgroundColor: "red",
            }}
          >
            <div
              className="heading"
              style={{
                fontFamily: "Sans-serif",
                fontSize: "2rem",
                color: "white",
              }}
            >
              Tweeker
            </div>
            {this.state.user ? (
              <div style={{ position: "absolute", right: 30 }}>
                <Button onClick={this.handlelogout} variantColor="red">
                  Log Out
                </Button>
              </div>
            ) : null}
            {this.state.loading ? (
              <Spinner></Spinner>
            ) : this.state.user ? (
              <div
                className="username"
                style={{
                  position: "absolute",
                  left: 30,
                  color: "white",
                  fontSize: "1.25rem",
                }}
              >
                {"Welcome, " + this.state.user.userName}
              </div>
            ) : (
              <div
                className="login-button"
                style={{ position: "absolute", right: 20 }}
              >
                <Button
                  onClick={this.handlelogin}
                  variantColor="orange"
                  rightIcon="arrow-forward"
                >
                  Login with Twitter
                </Button>
              </div>
            )}
          </div>
          <div
            className="banner"
            style={{
              width: "100%",
              height: "40vw",
              minWidth: "500px",
              minHeight: "200px",
              backgroundColor: "#4b92c3",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              zIndex: -1,
              color: "white",
              transition: "1s",
              fontSize: "5vw",
              fontFamily: "sans-serif",
              fontWeight: "lighter",
              paddingBottom: "4vw",
              alignItems: "flex-end",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Typist
              className="TypistExample-header"
              avgTypingDelay={100}
              startDelay={500}
              cursor={{
                element: "",
                hideWhenDone: false,
              }}
            >
              Analyze Your Twitter Timeline
            </Typist>
          </div>
          <div
            className="tab-container"
            style={{
              width: "100%",
              paddingRight: "50px",
              paddingLeft: "50px",
              paddingTop: "20px",
              paddingBottom: "50px",
            }}
          >
            <Tabs
              isFitted
              // variant="enclosed"
              variant="soft-rounded"
              variantColor="green"
            >
              <TabList mb="1em">
                <Tab>Tweets With Links</Tab>
                <Tab>Top Domains</Tab>
                <Tab>Share Master</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Stack spacing={8}>
                    {this.state.data.length > 0 ? (
                      this.renderTweets()
                    ) : this.state.user ? (
                      <Spinner></Spinner>
                    ) : null}
                  </Stack>
                </TabPanel>
                <TabPanel>
                  <Stack spacing={8}>
                    {JSON.stringify(this.state.topdomains) !== "{}" ? (
                      this.renderdomains()
                    ) : this.state.user ? (
                      <Spinner></Spinner>
                    ) : null}
                  </Stack>
                </TabPanel>
                <TabPanel>
                  <Stack spacing={8}>
                    {JSON.stringify(this.state.mostShares) !== "{}" ? (
                      this.renderSharers()
                    ) : this.state.user ? (
                      <Spinner></Spinner>
                    ) : null}
                  </Stack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        </div>
        {this.renderImage()}
      </ThemeProvider>
    );
  }
}

export default Homepage;
