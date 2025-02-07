import { Helmet } from "react-helmet";
import { Img, Button, Input, Heading } from "components/ui";
import React from "react";

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title>InterToll</title>
        <meta name="description" content="Web site created using create-react-app" />
      </Helmet>

      <div className="w-full bg-gradient">
        <div className="mt-[19.38rem] flex flex-col items-center gap-[1.13rem]">
          <div className="mx-auto flex w-full max-w-[85.50rem] flex-col items-center px-[3.50rem] md:px-[1.25rem]">
            <div className="ml-[0.88rem] flex w-[96%] items-start justify-center md:ml-0 md:w-full md:flex-col">
              
              {/* Left Section - Tagline & Image */}
              <div className="relative mt-[3.13rem] h-[13.50rem] flex-1 content-end md:h-auto md:w-full md:flex-none md:self-stretch">
                <Heading
                  size="headingxs"
                  as="h1"
                  className="mb-[0.38rem] ml-[4.38rem] text-[1.25rem] font-semibold md:ml-0"
                >
                  Connecting Highways, Simplifying Payments
                </Heading>
                <Img
                  src="images/img_i_3_2.png"
                  alt="I3two"
                  className="absolute bottom-0 left-0 top-0 my-auto h-[13.50rem] w-[76%] object-contain"
                />
              </div>

              {/* Right Section - Login Form */}
              <div className="flex w-[44%] flex-col items-end gap-[2.13rem] self-center md:w-full">
                <a
                  href="Login"
                  target="_blank"
                  rel="noreferrer"
                  className="ml-[9.63rem] self-start md:ml-0 md:text-[2.75rem] sm:text-[2.38rem]"
                >
                  <Heading
                    size="headinglg"
                    as="h2"
                    className="text-[3.00rem] font-bold tracking-[0.00rem] !text-gray-100_01"
                  >
                    Login
                  </Heading>
                </a>

                {/* Username Input */}
                <Input
                  shape="round"
                  type="text"
                  placeholder="Username"
                  className="w-[70%] rounded-[32px] px-[1.50rem]"
                />

                {/* Password Input */}
                <Input
                  shape="round"
                  colorScheme="indigo_800_01"
                  type="password"
                  placeholder="Password"
                  className="w-[70%] rounded-[32px] px-[1.50rem] sm:px-[1.25rem]"
                />

                {/* Continue Button */}
                <Button
                  shape="round"
                  className="mr-[3.75rem] w-full min-w-[15.88rem] max-w-[15.88rem] rounded-[24px] px-[2.13rem] md:mr-0 sm:px-[1.25rem]"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Image */}
          <Img src="images/img_group_73.svg" alt="Image" className="h-[21.25rem] w-full md:h-auto" />
        </div>
      </div>
    </>
  );
}