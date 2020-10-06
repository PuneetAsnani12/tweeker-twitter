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
  };

  componentDidMount() {
    axios.get("/api/auth").then((res) => {
      if (res.data.auth && !this.state.user) {
        this.setState({ user: res.data.User });
        axios
          .get("/api/home_timeline")
          .then((res) => {
            this.setState({ data: res.data.data });
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
            value={Math.ceil((ele[1].count / this.state.data.length) * 100)}
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
              backgroundColor: "#00acee",
              position: "relative",
              boxShadow: "2px 2px 15px 1px #fff",
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
                {/* <button onClick={this.handlelogin}>Login with Twitter</button> */}
              </div>
            )}
          </div>
          <div
            className="banner"
            style={{
              width: "100%",
              backgroundImage: `url(${Background})`,
              height: "600px",
              backgroundRepeat: "no-repeat",
              // backgroundAttachment: "fixed",
              backgroundSize: "cover",
              marginTop: "1px",
              zIndex: -1,
              color: "white",
              fontSize: "5rem",
              fontFamily: "sans-serif",
              fontWeight: "lighter",
              paddingBottom: "80px",
              paddingLeft: "20px",
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
              See {"&"} Analyze Your Tweets
            </Typist>
          </div>
          <div
            className="tab-container"
            style={{
              width: "100%",
              paddingRight: "50px",
              paddingLeft: "50px",
              paddingTop: "20px",
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
                  {/* <p>one!</p> */}
                  <Stack spacing={8}>
                    {this.state.data.length > 0 ? (
                      this.renderTweets()
                    ) : this.state.user ? (
                      <Spinner></Spinner>
                    ) : null}
                  </Stack>
                </TabPanel>
                <TabPanel>
                  {/* <p>two!</p> */}
                  <Stack spacing={8}>
                    {/* {console.log(this.state.topdomains)} */}
                    {JSON.stringify(this.state.topdomains) !== "{}" ? (
                      this.renderdomains()
                    ) : this.state.user ? (
                      <Spinner></Spinner>
                    ) : null}
                  </Stack>
                </TabPanel>
                <TabPanel>
                  {/* <p>three!</p> */}
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
      </ThemeProvider>
    );
  }
}

export default Homepage;
