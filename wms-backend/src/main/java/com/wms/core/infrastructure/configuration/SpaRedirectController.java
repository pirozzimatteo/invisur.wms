package com.wms.core.infrastructure.configuration;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaRedirectController {

    @RequestMapping(value = "/{path:[^\\.]*}")
    public String redirect() {
        // Forward to index.html to let React Router handle the route
        return "forward:/index.html";
    }
}
